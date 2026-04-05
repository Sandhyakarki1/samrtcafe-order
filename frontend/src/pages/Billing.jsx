import React, { useState, useEffect } from 'react';
import { CheckCircle, DollarSign, Printer, Receipt, Search } from 'lucide-react';


const BASE_URL = "https://groundwater-baking-timing-scsi.trycloudflare.com";

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchServedOrders();
    const interval = setInterval(fetchServedOrders, 10000); 
    return () => clearInterval(interval);
  }, []);

  const fetchServedOrders = async () => {
    try {
      
      const res = await fetch(`${BASE_URL}/api/orders/`);
      const data = await res.json();
      const servedOnly = data.filter(o => o.status === 'Served');
      setOrders(servedOnly);
    } catch (err) {
      console.error("Billing fetch error:", err);
    }
  };

  const handleSettlePayment = async (orderId) => {
    if (!window.confirm("Confirm Cash Received for this table?")) return;

    try {
      
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" })
      });

      if (res.ok) {
        alert("Payment Successful! Table is now free.");
        fetchServedOrders();
      }
    } catch (err) {
      alert("Connection error. Check MacBook connection.");
    }
  };

  return (
    <div className="p-8 bg-[#fcfcfd] min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Billing Counter</h1>
          <p className="text-slate-500 font-medium italic text-sm">Finalize cash settlements</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Search size={18} className="text-slate-300"/>
            <input type="text" placeholder="Search Table..." className="outline-none text-sm font-bold w-32" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders.filter(o => o.table_number.toString().includes(searchTerm)).length === 0 ? (
           <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <Receipt size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1}/>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No pending bills at the moment</p>
           </div>
        ) : (
          orders.filter(o => o.table_number.toString().includes(searchTerm)).map((order) => {
            const grandTotal = parseFloat(order.total_price);
            const netAmount = grandTotal / 1.13;
            const vatAmount = grandTotal - netAmount;

            return (
              <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-white relative overflow-hidden group transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order #{order.id}</p>
                    <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 justify-end"><CheckCircle size={10}/> Served</p>
                  </div>
                </div>

                <div className="mb-8">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Items list</p>
                   <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-100 pl-3">{order.items_text}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 font-mono border-2 border-dashed border-slate-200 text-xs">
                    <div className="flex justify-between mb-2 text-slate-500"><span>Net Amount:</span><span>Rs. {netAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-4 text-slate-500"><span>VAT (13%):</span><span>Rs. {vatAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-900 font-black text-xl border-t border-slate-200 pt-4"><span>Total:</span><span>Rs. {grandTotal.toFixed(0)}</span></div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => handleSettlePayment(order.id)} className="flex-1 bg-[#00D161] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"><DollarSign size={16}/> Settle Cash</button>
                    <button onClick={() => window.print()} className="bg-slate-100 text-slate-400 p-4 rounded-2xl hover:bg-indigo-50 transition-all"><Printer size={18}/></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Billing;