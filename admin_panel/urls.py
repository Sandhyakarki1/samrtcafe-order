from django.urls import path
from .views import (
    AdminLoginView,
    admin_forgot_password,
    admin_reset_password,
    StaffManagementView,
    StaffDetailView,
    MenuManagementView,
    MenuItemDetailView,
    OrderListView,
    OrderDetailView,
    PlaceOrderView,
)

urlpatterns = [
    # ----------------- ADMIN AUTH -----------------
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/forgot-password/', admin_forgot_password, name='admin-forgot-password'),
    path('admin/reset-password/', admin_reset_password, name='admin-reset-password'),

    # ----------------- STAFF MANAGEMENT -----------------
    path('staff/', StaffManagementView.as_view(), name='staff-list-create'),
    path('staff/<int:pk>/', StaffDetailView.as_view(), name='staff-detail'),

    # ----------------- MENU MANAGEMENT -----------------
    path('menu/', MenuManagementView.as_view(), name='menu-list-create'),
    path('menu/<int:pk>/', MenuItemDetailView.as_view(), name='menu-detail'),

    # ----------------- ORDER MANAGEMENT -----------------
    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    # ----------------- CUSTOMER PLACE ORDER -----------------
    path('place-order/', PlaceOrderView.as_view(), name='place-order'),
]
