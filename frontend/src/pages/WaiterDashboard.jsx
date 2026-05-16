import React, { useState, useEffect } from 'react';
import { Utensils, Navigation, BellRing, Clock } from 'lucide-react';

export default function WaiterDashboard() {
  const [readyOrders, setReadyOrders] = useState([]);

  const fetchReady = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/orders/");
      const data = await res.json();
      
      const filtered = data.filter(o => o.status === 'Ready');
      
      // 2. SORT LATEST FIRST (b.id - a.id)
      const sorted = filtered.sort((a, b) => b.id - a.id);
      
      setReadyOrders(sorted);
    } catch (err) { console.error(err); }
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
    <div className="p-8 bg-[#F1F6FF] min-h-screen text-left">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
          <Utensils size={32}/> Pickup Station
        </h1>
        <span className="text-[10px] font-black bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg shadow-emerald-200">
           {readyOrders.length} ORDERS READY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {readyOrders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-[45px] shadow-xl border-l-[12px] border-emerald-500 flex flex-col justify-between hover:-translate-y-1 transition-all duration-500">
            <div>
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="text-5xl font-black text-slate-800 tracking-tighter uppercase">Table {order.table_number}</span>
                      <p className="text-xs font-black text-slate-300 mt-2 uppercase tracking-[0.2em]">Ticket #00{order.id}</p>
                   </div>
                   <BellRing className="text-emerald-500 animate-bounce" size={32} />
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl mb-10 border border-slate-100">
                   <p className="text-xl text-slate-600 font-bold italic leading-relaxed">{order.items_text}</p>
                </div>
            </div>
            <button 
              onClick={() => markServed(order.id)} 
              className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-3 hover:bg-black shadow-2xl transition-all active:scale-95"
            >
              <Navigation size={22} fill="white"/> Confirm Delivered
            </button>
          </div>
        ))}
      </div>

      {readyOrders.length === 0 && (
        <div className="text-center mt-32">
           <Clock size={64} className="mx-auto text-slate-200 mb-6" strokeWidth={1}/>
           <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Nothing to serve right now</p>
        </div>
      )}
    </div>
  );
}