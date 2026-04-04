import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Plus, X, ShoppingCart, Utensils, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://wings-paintball-than-yrs.trycloudflare.com";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const refreshData = async () => {
    try {
      const orderRes = await fetch(`${BASE_URL}/api/orders/`);
      const orderData = await orderRes.json();
      setOrders(orderData.sort((a, b) => b.id - a.id));

      const menuRes = await fetch(`${BASE_URL}/api/menu/`);
      setMenuItems(await menuRes.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsServed = async (orderId) => {
    const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Served" })
    });
    if (res.ok) refreshData();
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.qty >= item.stock) return alert("Out of stock!");
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      if (item.stock <= 0) return alert("Out of stock!");
      setCart([...cart, { ...item, qty: 1, quantity: 1 }]);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!tableNumber || cart.length === 0) return alert("Select table and items!");
    const res = await fetch(`${BASE_URL}/api/place-order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: parseInt(tableNumber), items: cart.map(i => ({ id: i.id, qty: i.quantity })) })
    });
    if (res.ok) { setIsModalOpen(false); setCart([]); setTableNumber(""); refreshData(); }
  };

  const activeOrders = orders.filter(o => o.status !== 'Served' && o.status !== 'Paid' && o.status !== 'Cancelled');

  return (
    <div className="p-2 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Active Orders</h1>
           <p className="text-slate-400 font-medium text-sm">Managing {activeOrders.length} tables</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-100">+ Manual Order</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeOrders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-slate-50 hover:border-indigo-100 transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                <div className="text-right">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{order.status}</span>
                   <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Order #{order.id}</p>
                </div>
             </div>
             <div className="bg-slate-50 rounded-3xl p-5 mb-6 border border-slate-100 text-sm font-bold text-slate-700 italic leading-relaxed">
                {order.items_text}
             </div>
             <div className="flex justify-between items-center">
                <div className="text-2xl font-black text-slate-800 tracking-tighter">Rs {order.total_price}</div>
                <button onClick={() => handleMarkAsServed(order.id)} className="p-3 bg-indigo-50 text-indigo-400 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><CheckCircle size={28}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Orders;