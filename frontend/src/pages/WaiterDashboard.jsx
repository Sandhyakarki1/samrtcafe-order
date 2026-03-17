import React, { useState, useEffect } from 'react';
import { Utensils, Navigation, BellRing } from 'lucide-react';

export default function WaiterDashboard() {
  const [readyOrders, setReadyOrders] = useState([]);

  const fetchReady = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/orders/");
    const data = await res.json();
    setReadyOrders(data.filter(o => o.status === 'Ready'));
  };

  const markServed = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/orders/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'Served' })
    });
    fetchReady();
  };

  useEffect(() => { 
    fetchReady();
    const interval = setInterval(fetchReady, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-blue-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3"><Utensils/> Orders to Serve</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {readyOrders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-[40px] shadow-lg border-l-8 border-emerald-500 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-4">
                   <span className="text-4xl font-black text-slate-800 tracking-tighter">TABLE {order.table_number}</span>
                   <BellRing className="text-emerald-500 animate-bounce" />
                </div>
                <p className="text-lg text-slate-500 mb-8 font-medium">{order.items_text}</p>
            </div>
            <button onClick={() => markServed(order.id)} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95">
              <Navigation size={20}/> CONFIRM SERVED
            </button>
          </div>
        ))}
      </div>
      {readyOrders.length === 0 && <p className="text-center mt-20 text-slate-400 font-bold uppercase tracking-widest">No orders ready to serve yet.</p>}
    </div>
  );
}