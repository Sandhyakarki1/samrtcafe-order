import React, { useState, useEffect } from 'react';
import { ChefHat, Play, CheckCircle, Clock } from 'lucide-react';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/orders/");
    const data = await res.json();
    // Kitchen only sees things not yet Ready or Served
    setOrders(data.filter(o => o.status === 'Pending' || o.status === 'Preparing'));
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`http://127.0.0.1:8000/api/orders/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders(); // Refresh list after update
  };

  useEffect(() => { 
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-orange-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><ChefHat/> Kitchen Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm border-2 border-orange-100">
            <div className="flex justify-between mb-4">
                <span className="font-black text-xl">Table {order.table_number}</span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded-lg uppercase">{order.status}</span>
            </div>
            <p className="text-slate-600 mb-6 font-bold bg-slate-50 p-4 rounded-2xl italic">{order.items_text}</p>
            
            {order.status === 'Pending' ? (
              <button onClick={() => updateStatus(order.id, 'Preparing')} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all">
                <Play size={18}/> START PREPARING
              </button>
            ) : (
              <button onClick={() => updateStatus(order.id, 'Ready')} className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all">
                <CheckCircle size={18}/> MARK AS READY
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}