import random
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny

# Models and Serializers
# ✅ FIXED: Removed 'Feedback' and 'FeedbackSerializer' from these imports
from .models import Profile, Order, OrderItem, MenuItem
from .serializers import UserSerializer, MenuItemSerializer, OrderSerializer


# ==================================================
# ADMIN DASHBOARD STATISTICS 
# ==================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(request):
    """ Returns counts for the dashboard overview cards """
    total_orders = Order.objects.count()
    pending_orders = Order.objects.filter(status='Pending').count()
    total_menu = MenuItem.objects.count()
    total_staff = User.objects.filter(is_superuser=False).count()
    
    return Response({
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_menu": total_menu,
        "total_staff": total_staff
    })

# ==================================================
# AUTHENTICATION 
# ==================================================
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email"}, status=401)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == "Admin":
            return Response({"message": "Admin login success", "username": user.username, "role": "Admin"})
        return Response({"error": "Unauthorized. Not an admin."}, status=403)

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role")
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Staff account not found"}, status=401)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == role:
            return Response({"message": "Login successful", "username": user.username, "role": user.profile.role})
        return Response({"error": "Invalid credentials or role mismatch"}, status=401)

# ==================================================
# PASSWORD RECOVERY 
# ==================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_forgot_password(request):
    email = request.data.get("email")
    user = get_object_or_404(User, email=email)
    otp = str(random.randint(100000, 999999))
    user.profile.otp = otp
    user.profile.save()
    send_mail('SmartCafe OTP', f'Code: {otp}', settings.DEFAULT_FROM_EMAIL, [email])
    return Response({"message": "OTP sent"})

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_reset_password(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    password = request.data.get("password")
    user = get_object_or_404(User, email=email)
    if str(user.profile.otp) == str(otp):
        user.set_password(password)
        user.profile.otp = None
        user.profile.save()
        user.save()
        return Response({"message": "Password reset success"})
    return Response({"error": "Invalid OTP"}, status=400)

# ==================================================
# MANAGEMENT (STAFF & MENU) 
# ==================================================
class StaffManagementView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        staff = User.objects.filter(is_superuser=False)
        return Response(UserSerializer(staff, many=True).data)
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class StaffDetailView(APIView):
    permission_classes = [AllowAny]
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def delete(self, request, pk):
        get_object_or_404(User, pk=pk).delete()
        return Response(status=204)

class MenuManagementView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        items = MenuItem.objects.all()
        return Response(MenuItemSerializer(items, many=True).data)
    def post(self, request):
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class MenuItemDetailView(APIView):
    permission_classes = [AllowAny]
    def put(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    def delete(self, request, pk):
        get_object_or_404(MenuItem, pk=pk).delete()
        return Response(status=204)

# ==================================================
# ORDER LOGIC
# ==================================================
class PlaceOrderView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        try:
            with transaction.atomic():
                order = Order.objects.create(table_number=data['table_number'])
                total = 0

                for item_data in data['items']:
                    menu_item = MenuItem.objects.get(id=item_data['id'])
                    qty = int(item_data['qty'])

                    OrderItem.objects.create(
                        order=order, 
                        menu_item=menu_item, 
                        quantity=qty,
                        price=menu_item.price
                    )
                    total += (menu_item.price * qty)

                order.total_price = total
                order.save()
                return Response({"message": "Order placed!", "id": order.id, "order_id": order.id}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class OrderListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)

class OrderDetailView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(OrderSerializer(order).data)
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            return Response({"message": f"Updated to {new_status}"})
        return Response({"error": "Status required"}, status=400)
    
    def delete(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.delete()
        return Response(status=204)