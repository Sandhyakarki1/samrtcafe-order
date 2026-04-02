from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile, MenuItem, Order, OrderItem, Feedback, Billing

# ==================================================
# STAFF & PROFILE MANAGEMENT
# ==================================================
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'get_role', 'is_staff')
    list_filter = ('profile__role', 'is_staff')

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
            return "✅ High Stock"
        elif obj.stock > 0:
            return "⚠️ Low Stock"
        return "❌ Out of Stock"
    
    stock_status.short_description = 'Availability'

# ==================================================
# ORDER & BILLING MANAGEMENT
# ==================================================
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('menu_item', 'quantity', 'price') 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    
    list_display = ('id', 'table_number', 'status', 'total_price', 'created_at')
    
    # Allows admin to filter by Status (Pending, Served, Paid) and Table
    list_filter = ('status', 'table_number', 'created_at')
    
    # Allows admin to search by Order ID
    search_fields = ('id', 'table_number')
    
    inlines = [OrderItemInline]
    
    # Sort orders so the newest ones appear at the top in Django Admin
    ordering = ('-created_at',)

@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):
    # Only show orders that are either 'Served' (ready to pay) or 'Paid' 
    def get_queryset(self, request):
        return super().get_queryset(request).filter(status__in=['Served', 'Paid'])

    list_display = ('id', 'table_number', 'total_price', 'get_net_amount', 'get_vat_amount', 'status', 'created_at')
    list_filter = ('status', 'table_number')
    readonly_fields = ('table_number', 'total_price', 'get_net_amount', 'get_vat_amount', 'created_at')

    # Calculations for the Admin View (Inclusive 13% VAT)
    def get_net_amount(self, obj):
        return f"Rs. {round(float(obj.total_price) / 1.13, 2)}"
    get_net_amount.short_description = 'Net (Food)'

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