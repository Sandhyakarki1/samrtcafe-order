from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from decimal import Decimal

# ==================================================
# 1. CAFE (The Restaurant/Shop)
# ==================================================
class Cafe(models.Model):
    name = models.CharField(max_length=255)
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='managed_cafe')
    address = models.CharField(max_length=255)
    vat_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# ==================================================
# 2. PROFILE (Staff & Roles)
# ==================================================
class Profile(models.Model):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Waiter', 'Waiter'),
        ('Kitchen Staff', 'Kitchen Staff'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='staff', null=True, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Waiter')
    otp = models.CharField(max_length=6, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.cafe.name if self.cafe else 'No Cafe'})"

@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)

# ==================================================
# 3. MENU ITEMS
# ==================================================
class MenuItem(models.Model):
    CATEGORY_CHOICES = (
        ('Meals', 'Meals'),
        ('Snacks', 'Snacks'),
        ('Drinks', 'Drinks'),
    )
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='menu_items', null=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.cafe.name if self.cafe else 'N/A'})"

# ==================================================
# 4. ORDER
# ==================================================
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Preparing', 'Preparing'),
        ('Ready', 'Ready'),
        ('Served', 'Served'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
    )

    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, related_name='orders', null=True)
    table_number = models.IntegerField(choices=[(i, f'Table {i}') for i in range(1, 21)]) # Increased to 20 tables
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # PAYMENT FIELDS (eSewa / Cash)
    payment_method = models.CharField(max_length=20, default='Cash')
    transaction_uuid = models.CharField(max_length=255, null=True, blank=True)
    ref_id = models.CharField(max_length=255, null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def net_amount(self):
        return round(float(self.total_price) / 1.13, 2)

    @property
    def vat_amount(self):
        return round(float(self.total_price) - self.net_amount, 2)

    def __str__(self):
        return f"Order #{self.id} - {self.cafe.name if self.cafe else 'N/A'} (Table {self.table_number})"

# ==================================================
# 5. ORDER ITEMS
# ==================================================
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    instructions = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            if self.menu_item.stock < self.quantity:
                raise ValueError("Not enough stock!")
            self.menu_item.stock -= self.quantity
            self.menu_item.save()
            if not self.price:
                self.price = self.menu_item.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"

# ==================================================
# 6. BILLING (Proxy Model)
# ==================================================
class Billing(Order):
    class Meta:
        proxy = True
        verbose_name = 'Billing & Payment'
        verbose_name_plural = 'Billing & Payments'

# ==================================================
# 7. FEEDBACK
# ==================================================
class Feedback(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='feedback')
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.order.id} - {self.rating} Stars"