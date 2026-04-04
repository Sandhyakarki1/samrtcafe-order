import random
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

# Models and Serializers
from .models import Profile, Order, OrderItem, MenuItem, Feedback
from .serializers import UserSerializer, MenuItemSerializer, OrderSerializer, FeedbackSerializer

# ==================================================
#  ADMIN DASHBOARD STATISTICS 
# ==================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(request):
    today = timezone.now().date()
    # Today's Revenue calculation
    revenue = Order.objects.filter(status='Paid', created_at__date=today).aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    return Response({
        "today_revenue": revenue,
        "total_orders": Order.objects.count(),
        "pending_orders": Order.objects.filter(status='Pending').count(),
        "total_menu": MenuItem.objects.count(),
        "total_staff": User.objects.filter(is_superuser=False).count(),
        "active_tables": Order.objects.exclude(status__in=['Paid', 'Cancelled']).values('table_number').distinct().count()
    })

# ==================================================
# AUTHENTICATION
# ==================================================
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password")
        if not email or not password:
            return Response({"error": "Please provide both email and password"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        user = authenticate(username=user_obj.username, password=password)
        if user is not None:
            user_role = getattr(user.profile, "role", "Staff")
            if user_role == "Admin":
                return Response({
                    "message": "Login successful",
                    "username": user.username, 
                    "email": user.email,       
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Access denied. Admin portal only."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password, role = request.data.get("email"), request.data.get("password"), request.data.get("role")
        user_obj = get_object_or_404(User, email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == role:
            return Response({"message": "Login successful", "username": user.username, "role": user.profile.role})
        return Response({"error": "Invalid credentials"}, status=401)

# ==================================================
# STAFF & MENU MANAGEMENT
# ==================================================
class StaffManagementView(APIView):
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
    def get(self, request):
        items = MenuItem.objects.all().order_by('category')
        return Response(MenuItemSerializer(items, many=True).data)
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
        get_object_or_404(MenuItem, pk=pk).delete()
        return Response(status=204)

# ==================================================
# 4. ORDER LOGIC & TABLE CHECK
# ==================================================
class CheckTableStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, table_id):
        occupied = Order.objects.filter(table_number=table_id).exclude(status__in=['Paid', 'Cancelled']).exists()
        return Response({"occupied": occupied})

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
                    note = item_data.get('instructions', "")
                    OrderItem.objects.create(order=order, menu_item=menu_item, quantity=item_data['qty'], price=menu_item.price, instructions=note)
                    total += (menu_item.price * item_data['qty'])
                order.total_price = total
                order.save()
                return Response({"message": "Order placed!", "order_id": order.id}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class OrderListView(APIView):
    def get(self, request):
        order_type = request.query_params.get('type', 'live')
        if order_type == 'history':
            orders = Order.objects.filter(status='Paid').order_by('-created_at')
        else:
            orders = Order.objects.exclude(status='Paid').order_by('table_number')
        return Response(OrderSerializer(orders, many=True).data)

class OrderDetailView(APIView):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(OrderSerializer(order).data)
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            return Response({"message": "Updated"})
        return Response({"error": "Failed"}, status=400)

# ==================================================
# 5. BILLING & FEEDBACK 
# ==================================================
class SettleBillView(APIView):
    """ Marks an order as Paid """
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.status = 'Paid'
        order.save()
        return Response({"message": "Bill settled!"})

class BillDetailView(APIView):
    """ Shows VAT and Net Amount """
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        total = float(order.total_price)
        return Response({"table": order.table_number, "total": total, "vat": round(total - (total/1.13), 2)})

class FeedbackView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-created_at')
        return Response(FeedbackSerializer(feedbacks, many=True).data)
    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get('order_id'))
        Feedback.objects.create(order=order, rating=request.data.get('rating'), comment=request.data.get('comment'))
        return Response({"message": "Success"}, status=201)

# PASSWORD RECOVERY
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
    email, otp, password = request.data.get("email"), request.data.get("otp"), request.data.get("password")
    user = get_object_or_404(User, email=email)
    if str(user.profile.otp) == str(otp):
        user.set_password(password)
        user.profile.otp = None
        user.profile.save()
        user.save()
        return Response({"message": "Success"})
    return Response({"error": "Invalid OTP"}, status=400)