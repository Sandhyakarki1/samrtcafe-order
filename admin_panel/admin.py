from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from .models import Profile, MenuItem, Order, OrderItem, Feedback, Billing

# ==================================================
# STAFF & PROFILE MANAGEMENT 
# ==================================================
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    # UPDATED: Added 'is_active' to see who is deactivated 
    list_display = ('username', 'email', 'get_role', 'is_active', 'is_staff')
    list_filter = ('profile__role', 'is_active', 'is_staff')
    
    def get_role(self, obj):
        return obj.profile.role if hasattr(obj, 'profile') else "No Role"
    get_role.short_description = 'Role'

    User._meta.verbose_name = "Staff Account"
    User._meta.verbose_name_plural = "Staff Accounts"

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

# ==================================================
# MENU MANAGEMENT
# ==================================================
@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'stock_status')
    list_filter = ('category',) 
    search_fields = ('name',)

    def stock_status(self, obj):
        if obj.stock > 10:
            return format_html('<b style="color:green;">✅ High Stock</b>')
        elif obj.stock > 0:
            return format_html('<b style="color:orange;">⚠️ Low Stock</b>')
        return format_html('<b style="color:red;">❌ Out of Stock</b>')
    
    stock_status.short_description = 'Availability'

# ==================================================
# ORDER MANAGEMENT (Latest First & Payment Method)
# ==================================================
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('menu_item', 'quantity', 'price') 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # UPDATED: Added 'payment_method' to display
    list_display = ('id', 'table_number', 'status', 'get_payment_icon', 'total_price', 'created_at')
    
    # Allows admin to filter by Payment Method as well
    list_filter = ('status', 'payment_method', 'table_number', 'created_at')
    search_fields = ('id', 'table_number')
    inlines = [OrderItemInline]
    ordering = ('-id',) # Latest orders at the top

    def get_payment_icon(self, obj):
        if obj.payment_method.lower() == 'esewa':
            return format_html('<span style="color: #60bb46; font-weight:bold;">📱 eSewa</span>')
        return format_html('<span style="color: #f59e0b; font-weight:bold;">💵 Cash</span>')
    get_payment_icon.short_description = 'Method'

# ==================================================
# BILLING MANAGEMENT 
# ==================================================
@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    def get_queryset(self, request):
        # Focus on orders that are Served or Paid
        return super().get_queryset(request).filter(status__in=['Served', 'Paid'])

    list_display = ('id', 'table_number', 'payment_method', 'total_price', 'get_vat_amount', 'status', 'created_at')
    list_filter = ('payment_method', 'status', 'created_at')
    readonly_fields = ('table_number', 'total_price', 'created_at')
    ordering = ('-created_at',)

    def get_net_amount(self, obj):
        return f"Rs. {round(float(obj.total_price) / 1.13, 2)}"
    get_net_amount.short_description = 'Net'

    def get_vat_amount(self, obj):
        net = float(obj.total_price) / 1.13
        vat = float(obj.total_price) - net
        return f"Rs. {round(vat, 2)}"
    get_vat_amount.short_description = 'VAT (13%)'

# ==================================================
# FEEDBACK MANAGEMENT
# ==================================================
@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_table', 'rating_stars', 'comment', 'created_at')
    list_filter = ('rating', 'created_at')
    ordering = ('-created_at',)

    def get_table(self, obj):
        return f"Table {obj.order.table_number}"
    get_table.short_description = 'Source'

    def rating_stars(self, obj):
        return "⭐" * obj.rating
    rating_stars.short_description = 'Rating'

# ==================================================
# ADMIN INTERFACE CUSTOMIZATION
# ==================================================
admin.site.site_header = "SmartCafe Admin Portal"
admin.site.site_title = "SmartCafe Management"
admin.site.index_title = "System Administration"