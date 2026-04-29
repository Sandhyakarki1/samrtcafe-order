import random
import requests
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
        "total_staff": User.objects.filter(is_superuser=False, is_active=True).count(),
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
# PASSWORD RECOVERY (GMAIL OTP)
# ==================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
    
    user = get_object_or_404(User, email=email)
    otp = str(random.randint(100000, 999999))
    user.profile.otp = otp
    user.profile.save()
    
    try:
        send_mail(
            'SmartCafe - Password Reset Code', 
            f'Your OTP code for password reset is: {otp}', 
            settings.DEFAULT_FROM_EMAIL, 
            [email]
        )
        return Response({"message": "OTP sent to your Gmail"})
    except Exception as e:
        return Response({"error": f"Failed to send email: {str(e)}"}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_reset_password(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    password = request.data.get("password")
    
    if not all([email, otp, password]):
        return Response({"error": "Email, OTP, and New Password are required"}, status=400)

    user = get_object_or_404(User, email=email)
    
    if str(user.profile.otp) == str(otp):
        user.set_password(password) # This hashes the password securely
        user.profile.otp = None # Clear OTP after use
        user.profile.save()
        user.save()
        return Response({"message": "Password updated successfully!"})
    
    return Response({"error": "Invalid OTP"}, status=400)

# ==================================================
# STAFF & MENU MANAGEMENT
# ==================================================
class StaffManagementView(APIView):
    def get(self, request):
        staff = User.objects.filter(is_superuser=False).order_by('-is_active', 'username')
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

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
            user.save()
            status_text = "activated" if user.is_active else "deactivated"
            return Response({"message": f"Staff member {status_text} successfully"})
        return Response({"error": "No status provided"}, status=400)

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = False
        user.save()
        return Response({"message": "Staff member deactivated (Soft Delete)"}, status=200)

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
# ORDER LOGIC & TABLE CHECK
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
                payment_method = data.get('payment_method', 'cash')

        
                order = Order.objects.create(
                    table_number=data['table_number'],
                    payment_method=payment_method,  
                    status='Pending'               
                )

                total = 0
                for item_data in data['items']:
                    menu_item = MenuItem.objects.get(id=item_data['id'])
                    note = item_data.get('instructions', "")
                    
                    OrderItem.objects.create(
                        order=order, 
                        menu_item=menu_item, 
                        quantity=item_data['qty'], 
                        price=menu_item.price, 
                        instructions=note
                    )
                    
                    total += (menu_item.price * item_data['qty'])
                order.total_price = total
                order.save()

                return Response({
                    "message": "Order placed successfully!", 
                    "order_id": order.id,
                    "payment_method": order.payment_method
                }, status=201)

        except MenuItem.DoesNotExist:
            return Response({"error": "One or more items in your cart no longer exist."}, status=400)
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

class KhaltiVerifyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        amount = request.data.get("amount") 
        order_id = request.data.get("order_id")

        # Khalti API URL
        url = "https://khalti.com/api/v2/payment/verify/"
        
        payload = {
            "token": token,
            "amount": amount
        }
        headers = {
            # Use the Universal Test Secret Key
            "Authorization": "Key test_secret_key_f59c8ad03f3445c2a118310d5104a0d3"
        }

        #  Contact Khalti Server
        response = requests.post(url, payload, headers=headers)

        if response.status_code == 200:
            #  Payment is Valid! Update Order Status
            order = Order.objects.get(id=order_id)
            order.status = 'Paid'
            order.payment_method = 'Khalti'
            order.save()
            return Response({"message": "Payment Verified"}, status=200)
        else:
            # Payment Failed or Fake
            return Response({"error": "Khalti Verification Failed"}, status=400)


# ==================================================
# BILLING & FEEDBACK 
# ==================================================
class SettleBillView(APIView):
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.status = 'Paid'
        order.save()
        return Response({"message": "Bill settled!"})

class BillDetailView(APIView):
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