import random
import requests
import base64
import json
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Profile, Order, OrderItem, MenuItem, Feedback
from .serializers import (
    UserSerializer,
    MenuItemSerializer,
    OrderSerializer,
    FeedbackSerializer
)

# ==================================================
# 1. DASHBOARD & STATS
# ==================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(request):
    today = timezone.now().date()
    revenue = Order.objects.filter(status='Paid', created_at__date=today).aggregate(Sum('total_price'))['total_price__sum'] or 0
    return Response({
        "today_revenue": float(revenue),
        "total_orders": Order.objects.count(),
        "pending_orders": Order.objects.filter(status='Pending').count(),
        "total_menu": MenuItem.objects.count(),
        "total_staff": User.objects.filter(is_superuser=False, is_active=True).count(),
        "active_tables": Order.objects.exclude(status='Paid').count()
    })

# ==================================================
# 2. AUTHENTICATION & OTP
# ==================================================
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password")
        user_obj = get_object_or_404(User, email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == "Admin":
            return Response({"message": "Login successful", "username": user.username})
        return Response({"error": "Invalid credentials"}, status=401)

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password, role = request.data.get("email"), request.data.get("password"), request.data.get("role")
        user_obj = get_object_or_404(User, email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == role:
            return Response({"message": "Login successful", "username": user.username, "role": user.profile.role})
        return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_forgot_password(request):
    email = request.data.get("email")
    user = get_object_or_404(User, email=email)
    otp = str(random.randint(100000, 999999))
    user.profile.otp = otp
    user.profile.save()
    send_mail("SmartCafe OTP", f"Your OTP is: {otp}", settings.DEFAULT_FROM_EMAIL, [email])
    return Response({"message": "OTP sent"})

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_reset_password(request):
    email, otp, password = request.data.get("email"), request.data.get("otp"), request.data.get("password")
    user = get_object_or_404(User, email=email)
    if str(user.profile.otp) == str(otp):
        user.set_password(password)
        user.profile.otp = None
        user.profile.save()
        user.save()
        return Response({"message": "Password updated"})
    return Response({"error": "Invalid OTP"}, status=400)

# ==================================================
# 3. STAFF MANAGEMENT
# ==================================================
class StaffManagementView(APIView):
    def get(self, request):
        staff = User.objects.filter(is_superuser=False)
        return Response(UserSerializer(staff, many=True).data)

class StaffDetailView(APIView):
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# ==================================================
# 4. MENU MANAGEMENT
# ==================================================
class MenuManagementView(APIView):
    def get(self, request):
        items = MenuItem.objects.all()
        return Response(MenuItemSerializer(items, many=True).data)

class MenuItemDetailView(APIView):
    def get(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        return Response(MenuItemSerializer(item).data)
    def put(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def delete(self, request, pk):
        get_object_or_404(MenuItem, pk=pk).delete()
        return Response({"message": "Deleted"})

# ==================================================
# 5. ORDER & TABLE LOGIC
# ==================================================
class OrderListView(APIView):
    def get(self, request):

        orders = Order.objects.all().order_by('-id')
        return Response(OrderSerializer(orders, many=True).data)


class OrderDetailView(APIView):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(OrderSerializer(order).data)
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.status = request.data.get("status", order.status)
        order.payment_method = request.data.get("payment_method", order.payment_method)
        order.save()
        return Response({"message": "Updated"})

class PlaceOrderView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        with transaction.atomic():
            order = Order.objects.create(
                table_number=data["table_number"],
                payment_method=data.get("payment_method", "Cash"),
                status="Pending"
            )
            total = 0
            for item in data["items"]:
                menu = MenuItem.objects.get(id=item["id"])
                OrderItem.objects.create(
                    order=order, menu_item=menu, quantity=item["qty"],
                    price=menu.price, instructions=item.get("instructions", "")
                )
                total += menu.price * item["qty"]
            order.total_price = total
            order.save()
        return Response({"message": "Order placed", "order_id": order.id})

class CheckTableStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, table_id):
        occupied = Order.objects.filter(table_number=table_id).exclude(status="Paid").exists()
        return Response({"occupied": occupied})

# ==================================================
# 6. PAYMENT & BILLING
# ==================================================
class EsewaVerifyView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get("token")
        order_id = request.data.get("order_id")
        if token == "ESEWA_VIVA_SUCCESS_TOKEN":
            order = get_object_or_404(Order, id=order_id)
            order.status = "Paid"
            order.payment_method = "eSewa"
            order.save()
            return Response({"message": "Verified"}, status=200)
        return Response({"error": "Invalid Token"}, status=400)

class SettleBillView(APIView):
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.status = "Paid"
        order.payment_method = "cash"
        order.save()
        return Response({"message": "Bill settled"})

class BillDetailView(APIView):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        total = float(order.total_price)
        net = round(total / 1.13, 2)
        vat = round(total - net, 2)
        return Response({"table": order.table_number, "total": total, "net": net, "vat": vat})

# ==================================================
# 7. FEEDBACK
# ==================================================
class FeedbackView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-created_at')
        return Response(FeedbackSerializer(feedbacks, many=True).data)
    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"))
        Feedback.objects.create(order=order, rating=request.data.get("rating"), comment=request.data.get("comment"))
        return Response({"message": "Success"})