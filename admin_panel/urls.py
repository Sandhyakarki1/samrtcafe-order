from django.urls import path
from .views import (
    AdminLoginView, StaffLoginView,
    admin_forgot_password, admin_reset_password, admin_dashboard_stats,
    StaffManagementView, StaffDetailView,
    MenuManagementView, MenuItemDetailView,
    OrderListView, OrderDetailView, PlaceOrderView, 
    FeedbackView, SettleBillView, BillDetailView, 
    CheckTableStatusView, 
)

urlpatterns = [
    # ==========================================
    # AUTHENTICATION
    # ==========================================
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('staff/login/', StaffLoginView.as_view(), name='staff_login'),
    path('admin/forgot-password/', admin_forgot_password, name='forgot_password'),
    path('admin/reset-password/', admin_reset_password, name='reset_password'),
    path('stats/', admin_dashboard_stats, name='admin_stats'),
    
    # ==========================================
    # STAFF MANAGEMENT 
    # ==========================================
    path('staff/', StaffManagementView.as_view(), name='staff_list'),
    path('staff/<int:pk>/', StaffDetailView.as_view(), name='staff_detail'),
    
    # ==========================================
    # MENU MANAGEMENT 
    # ==========================================
    path('menu/', MenuManagementView.as_view(), name='menu_list'),
    path('menu/<int:pk>/', MenuItemDetailView.as_view(), name='menu_detail'),
    
    # ==========================================
    # ORDER SYSTEM (Customer, Kitchen, Waiter)
    # ==========================================
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('place-order/', PlaceOrderView.as_view(), name='place_order'),
    path('check-table/<int:table_id>/', CheckTableStatusView.as_view(), name='check_table'),
    
    # ==========================================
    # BILLING & FEEDBACK 
    # ==========================================
    path('feedback/', FeedbackView.as_view(), name='feedback_api'),
    path('orders/<int:pk>/settle/', SettleBillView.as_view(), name='settle_bill'),
    path('orders/<int:pk>/bill-details/', BillDetailView.as_view(), name='bill_details'),
]