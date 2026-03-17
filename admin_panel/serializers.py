from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
from .models import MenuItem
from .models import Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    # 'role' is used for incoming data (POST/PUT)
    role = serializers.CharField(write_only=True, required=False)
    # 'assigned_role' is used for outgoing data (GET) - matches  React fetch logic
    assigned_role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'assigned_role']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False} 
        }

    def get_assigned_role(self, obj):
        # Safely get the role from the profile
        return getattr(obj.profile, 'role', 'Waiter')

    def create(self, validated_data):
        # Extract role and password
        role_data = validated_data.pop('role', 'Waiter')
        password = validated_data.pop('password')
        
        #  Create the User (This triggers the signal to create the Profile)
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        #  Update the role in the profile 
        # We use get_or_create just to be 100% safe
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.role = role_data
        profile.save()
        
        return user

    def update(self, instance, validated_data):
        # Extract role and password if they exist
        role_data = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        
        # Update standard User fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        
        # Handle password update (if provided in the React edit form)
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update Profile role
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
    # This pulls the food name 
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    
    items = OrderItemSerializer(many=True, read_only=True)
    
    items_text = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'table_number', 'status', 'total_price', 'items', 'items_text', 'created_at']

    def get_items_text(self, obj):
        # This loops through the items and makes a nice text string
        order_items = obj.items.all()
        return ", ".join([f"{item.quantity}x {item.menu_item.name}" for item in order_items])
   