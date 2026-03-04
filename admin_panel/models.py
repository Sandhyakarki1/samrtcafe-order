from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# 1. PROFILE MODEL (For Admin/Waiter Roles)
class Profile(models.Model):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Waiter', 'Waiter'),
        ('Kitchen Staff', 'Kitchen Staff'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Waiter')
    otp = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

# Signal to auto-create Profile
@receiver(post_save, sender=User)
def manage_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)
    if hasattr(instance, 'profile'):
        instance.profile.save()


# 2. MENU ITEM MODEL
class MenuItem(models.Model):
    CATEGORY_CHOICES = (
        ('Meals', 'Meals'),
        ('Snacks', 'Snacks'),
        ('Drinks', 'Drinks'),
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


# 3. ORDER MODEL
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Preparing', 'Preparing'),
        ('Ready', 'Ready'),
        ('Served', 'Served'),
    )
    table_number = models.IntegerField(choices=[(i, f'Table {i}') for i in range(1, 6)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Table {self.table_number} - {self.status}"


# 4. ORDER ITEM MODEL
class OrderItem(models.Model):
    order = models.ForeignKey('Order', related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # price at order time

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"

    def total_price(self):
        return self.quantity * self.price
