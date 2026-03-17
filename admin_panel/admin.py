from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile, MenuItem 
from .models import Profile
from .models import Order, OrderItem


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False

class CustomUserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, )
    # This adds the "Role" column to the Django Admin list
    list_display = ('username', 'email', 'get_role', 'is_staff')

    def get_role(self, obj):
        return obj.profile.role if hasattr(obj, 'profile') else "No Role"
    get_role.short_description = 'Role'

    # RENAME "Users" TO "Staff Accounts"
    User._meta.verbose_name = "Staff Account"
    User._meta.verbose_name_plural = "Staff Accounts"

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
# Register the MenuItem model here
@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock', 'stock_status')

    # we use 'category' and 'stock' or just 'category'.
    list_filter = ('category',) 
    
    search_fields = ('name',)

    # Create a custom method to show availability nicely in the admin
    def stock_status(self, obj):
        if obj.stock > 0:
            return "✅ In Stock"
        return "❌ Out of Stock"
    
    # This sets the column name in the admin
    stock_status.short_description = 'Availability'

# This allows  to see the food items inside the order page
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('menu_item', 'quantity')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'table_number', 'status', 'total_price', 'created_at')
    list_display = ('id', 'table_number', 'status', 'total_price', 'created_at')
    
    inlines = [OrderItemInline]