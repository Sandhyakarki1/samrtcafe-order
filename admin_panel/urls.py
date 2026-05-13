from django.urls import path
from .views import (
    AdminLoginView, StaffLoginView,
    admin_forgot_password, admin_reset_password, admin_dashboard_stats,

    StaffManagementView, StaffDetailView,

    MenuManagementView, MenuItemDetailView,

    OrderListView, OrderDetailView, PlaceOrderView,
    KhaltiVerifyView,

    FeedbackView, SettleBillView, BillDetailView,
    CheckTableStatusView,
)

urlpatterns = [

    # ==========================================
    # AUTH
    # ==========================================
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('staff/login/', StaffLoginView.as_view(), name='staff_login'),
    path('admin/forgot-password/', admin_forgot_password),
    path('admin/reset-password/', admin_reset_password),
    path('stats/', admin_dashboard_stats),

    # ==========================================
    # STAFF
    # ==========================================
    path('staff/', StaffManagementView.as_view()),
    path('staff/<int:pk>/', StaffDetailView.as_view()),

    # ==========================================
    # MENU
    # ==========================================
    path('menu/', MenuManagementView.as_view()),
    path('menu/<int:pk>/', MenuItemDetailView.as_view()),

    # ==========================================
    # ORDERS
    # ==========================================
    path('orders/', OrderListView.as_view()),
    path('orders/<int:pk>/', OrderDetailView.as_view()),
    path('place-order/', PlaceOrderView.as_view()),
    path('check-table/<int:table_id>/', CheckTableStatusView.as_view()),

    # ==========================================
    # BILLING
    # ==========================================
    path('orders/<int:pk>/settle/', SettleBillView.as_view()),
    path('orders/<int:pk>/bill-details/', BillDetailView.as_view()),

    # ==========================================
    # FEEDBACK
    # ==========================================
    path('feedback/', FeedbackView.as_view()),

    # ==========================================
    # PAYMENT
    # ==========================================
    path('api/khalti/verify/', KhaltiVerifyView.as_view()),
]