from django.urls import path
from .views import (
    AdminLoginView, StaffLoginView,
    admin_forgot_password, admin_reset_password, admin_dashboard_stats,
    StaffManagementView, StaffDetailView,
    MenuManagementView, MenuItemDetailView,
    OrderListView, OrderDetailView, PlaceOrderView,   
)

urlpatterns = [
    # Auth & Stats
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('staff/login/', StaffLoginView.as_view(), name='staff_login'),
    path('admin/forgot-password/', admin_forgot_password, name='forgot_password'),
    path('admin/reset-password/', admin_reset_password, name='reset_password'),
    path('stats/', admin_dashboard_stats, name='admin_stats'),
    
    # Staff Management
    path('staff/', StaffManagementView.as_view(), name='staff_list'),
    path('staff/<int:pk>/', StaffDetailView.as_view(), name='staff_detail'),
    
    # Menu Management
    path('menu/', MenuManagementView.as_view(), name='menu_list'),
    path('menu/<int:pk>/', MenuItemDetailView.as_view(), name='menu_detail'),
    
    # Order Management
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('place-order/', PlaceOrderView.as_view(), name='place_order'),
    
   
]