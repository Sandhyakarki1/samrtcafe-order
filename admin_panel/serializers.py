from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, MenuItem, Order, OrderItem, Feedback

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False)
    assigned_role = serializers.SerializerMethodField()

    class Meta:
      model = User
      
      fields = ['id', 'username', 'email', 'password', 'role', 'assigned_role', 'is_active']
      extra_kwargs = {
        'password': {'write_only': True, 'required': False} 
    }

    def get_assigned_role(self, obj):
     return getattr(obj.profile, 'role', 'Waiter')

    def create(self, validated_data):
       role_data = validated_data.pop('role', 'Waiter')
       password = validated_data.pop('password')
       is_active = validated_data.pop('is_active', True)
       
       user = User.objects.create_user(**validated_data)
       user.set_password(password)
       user.is_active = is_active 
       user.save()
       profile, _ = Profile.objects.get_or_create(user=user)
       profile.role = role_data
       profile.save()
       return user

    def update(self, instance, validated_data):
        role_data = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        
       
        if 'is_active' in validated_data:
            instance.is_active = validated_data.get('is_active', instance.is_active)
        

        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        if password:
            instance.set_password(password)
        instance.save()
        if role_data:
           profile, _ = Profile.objects.get_or_create(user=instance)
           profile.role = role_data
           profile.save()
        return instance 

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'price', 'instructions']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_text = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'table_number', 'status', 'total_price', 'items', 'items_text', 'created_at']

    def get_items_text(self, obj):
        order_items = obj.items.all()
        summary = []
        for item in order_items:
            text = f"{item.quantity}x {item.menu_item.name}"
            if item.instructions:
                text += f" ({item.instructions})" 
            summary.append(text)
        return ", ".join(summary)

        return ", ".join([f"{item.quantity}x {item.menu_item.name}" for item in order_items])

class FeedbackSerializer(serializers.ModelSerializer):
    table_number = serializers.ReadOnlyField(source='order.table_number')
    items_summary = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = ['id', 'order', 'table_number', 'items_summary', 'rating', 'comment', 'formatted_date']

    def get_formatted_date(self, obj):
        
        return obj.created_at.strftime("%b %d, %I:%M %p")

    def get_items_summary(self, obj):
        # Retrieves the food items so the admin sees what was reviewed
        items = obj.order.items.all()
        return ", ".join([f"{i.quantity}x {i.menu_item.name}" for i in items])