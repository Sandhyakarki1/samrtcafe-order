from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Order
from .serializers import OrderSerializer

from django.conf import settings
import random

from .models import Profile, Order, OrderItem, MenuItem
from .serializers import UserSerializer, MenuItemSerializer, OrderSerializer

# ----------------- ADMIN AUTHENTICATION -----------------

class AdminLoginView(APIView):
    def post(self, request):
        login_input = request.data.get("email")
        password = request.data.get("password")
        try:
            # Determine if email or username
            if "@" in login_input:
                user_obj = User.objects.get(email=login_input)
            else:
                user_obj = User.objects.get(username=login_input)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or username"}, status=401)

        user = authenticate(username=user_obj.username, password=password)
        if user and user.is_superuser:
            return Response({
                "message": "Login successful",
                "username": user.username,
                "email": user.email,
                "role": getattr(user.profile, "role", "Admin")
            })
        return Response({"error": "Invalid credentials or not an admin"}, status=401)


# ----------------- PASSWORD RECOVERY (OTP) -----------------

@api_view(['POST'])
def admin_forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
    try:
        user = User.objects.get(email=email, is_superuser=True)
        otp = random.randint(100000, 999999)
        user.profile.otp = otp
        user.profile.save()

        send_mail(
            'SmartCafe OTP Code',
            f'Your password reset code is: {otp}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({"message": "OTP sent to your email"})
    except User.DoesNotExist:
        return Response({"error": "Admin email not found"}, status=404)


@api_view(['POST'])
def admin_reset_password(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    password = request.data.get("password")

    if not all([email, otp, password]):
        return Response({"error": "All fields are required"}, status=400)
    try:
        user = User.objects.get(email=email, is_superuser=True)
        if user.profile.otp == int(otp):
            user.set_password(password)
            user.save()
            user.profile.otp = None
            user.profile.save()
            return Response({"message": "Password reset successfully"})
        return Response({"error": "Invalid OTP code"}, status=400)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


# ----------------- STAFF MANAGEMENT -----------------

class StaffManagementView(APIView):
    def get(self, request):
        staff = User.objects.filter(is_superuser=False)
        serializer = UserSerializer(staff, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class StaffDetailView(APIView):
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response({"message": "Staff deleted"}, status=204)


# ----------------- MENU MANAGEMENT -----------------

class MenuManagementView(APIView):
    def get(self, request):
        items = MenuItem.objects.all().order_by('category')
        serializer = MenuItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class MenuItemDetailView(APIView):
    def put(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk)
        item.delete()
        return Response(status=204)


# ----------------- CUSTOMER ORDER API -----------------

class PlaceOrderView(APIView):
    """ API for customers to place orders and store price from MenuItem """
    def post(self, request):
        data = request.data  # { "table_number": 1, "items": [{"id": 1, "qty": 2}] }

        table_number = data.get('table_number')
        items_data = data.get('items')

        if not table_number or not items_data:
            return Response({"error": "Table number and items are required"}, status=400)

        try:
            with transaction.atomic():
                order = Order.objects.create(table_number=table_number)
                total_price = 0

                for item in items_data:
                    menu_item_id = item.get('id')
                    qty = int(item.get('qty', 1))
                    menu_item = MenuItem.objects.get(id=menu_item_id)

                    if menu_item.stock < qty:
                        raise Exception(f"Not enough stock for {menu_item.name}")

                    menu_item.stock -= qty
                    menu_item.save()

                    OrderItem.objects.create(
                        order=order,
                        menu_item=menu_item,
                        quantity=qty,
                        price=menu_item.price
                    )

                    total_price += menu_item.price * qty

                order.total_price = total_price
                order.save()

                serializer = OrderSerializer(order)
                return Response(serializer.data, status=201)

        except MenuItem.DoesNotExist:
            return Response({"error": "One or more items not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# ----------------- ORDER MANAGEMENT -----------------

class OrderListView(APIView):
    """ For admin to see all orders """
    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
class OrderDetailView(APIView):
    """Get single order by ID for tracking"""
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderSerializer(order)
        return Response(serializer.data)



    def delete(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.delete()
        return Response(status=204)
