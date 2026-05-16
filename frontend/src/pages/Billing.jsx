import React, { useState, useEffect } from 'react';
import { CheckCircle, DollarSign, Printer, Receipt, Search, CreditCard, Banknote } from 'lucide-react';

const BASE_URL = "https://philosophy-serious-grateful-implementation.trycloudflare.com";

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("pending");

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 
    return () => clearInterval(interval);
  }, [view]);

  const fetchOrders = async () => {
    try {
      // We fetch ALL orders so we can filter them correctly in the frontend
      const res = await fetch(`${BASE_URL}/api/orders/`);
      const data = await res.json();
      
      if (view === "pending") {
        // --- ACTIVE BILLS TAB ---
        // Show ONLY Cash orders that are NOT yet Paid.
        // If it's eSewa, it's already paid, so don't show it here.
        const activeCashOnly = data.filter(o => 
          o.payment_method?.toLowerCase() === 'cash' && o.status !== 'Paid'
        );
        setOrders(activeCashOnly.sort((a, b) => b.id - a.id));

      } else {
        // --- HISTORY TAB ---
        // Show everything that is officially 'Paid' 
        // OR any eSewa order (because eSewa is pre-paid, even if it's being cooked/served)
        const historyData = data.filter(o => 
          o.status === 'Paid' || o.payment_method?.toLowerCase() === 'esewa'
        );
        setOrders(historyData.sort((a, b) => b.id - a.id));
      }
    } catch (err) {
      console.error("Billing fetch error:", err);
    }
  };

  const handleSettlePayment = async (orderId) => {
    if (!window.confirm("Confirm Cash Received?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid", payment_method: "cash" })
      });
      if (res.ok) {
        alert("Cash Settled! Moved to History.");
        fetchOrders();
      }
    } catch (err) { alert("Error."); }
  };

  const printReceipt = (order) => {
    const method = (order.payment_method || 'CASH').toUpperCase();
    const net = (order.total_price / 1.13).toFixed(2);
    const vat = (order.total_price - net).toFixed(2);
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head><title>Receipt #${order.id}</title></head>
        <body style="font-family:monospace; padding:20px;">
          <h2 style="text-align:center">SMART-CAFE</h2>
          <hr/>
          <p>Table: ${order.table_number} | Order: #${order.id}</p>
          <p>Method: ${method}</p>
          <hr/>
          <p>${order.items_text}</p>
          <hr/>
          <p>Total: Rs. ${order.total_price}</p>
          <p style="text-align:center">Paid via ${method}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="p-8 bg-[#fcfcfd] min-h-screen text-left animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {view === "pending" ? "Active Bills" : "Billing History"}
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            {view === "pending" ? "Waiting for cash at counter" : "All digital and cash-settled orders"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button onClick={() => setView("pending")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "pending" ? "bg-white shadow-md text-emerald-600" : "text-slate-400"}`}>ACTIVE</button>
            <button onClick={() => setView("history")} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${view === "history" ? "bg-white shadow-md text-emerald-600" : "text-slate-400"}`}>HISTORY</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {orders
          .filter(o => o.table_number.toString().includes(searchTerm))
          .map((order) => {
             const isOnline = order.payment_method?.toLowerCase() === 'esewa';
             return (
              <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-white relative transition-all hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                  <div className="text-right">
                    <span className={`flex items-center gap-1 justify-end text-[10px] font-black uppercase mb-1 ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                       {isOnline ? <CreditCard size={12}/> : <Banknote size={12}/>} 
                       {order.payment_method || 'CASH'}
                    </span>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Paid' ? 'text-blue-500' : 'text-indigo-500'}`}>
                       {order.status}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                   <p className="text-sm font-bold text-slate-700 italic border-l-4 border-indigo-100 pl-3">{order.items_text}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 font-mono border-2 border-dashed border-slate-200">
                    <div className="flex justify-between text-slate-900 font-black text-xl italic"><span>Total:</span><span>Rs. {order.total_price}</span></div>
                </div>

                <div className="flex gap-2">
                    {/* BUTTON LOGIC */}
                    {order.payment_method?.toLowerCase() === 'cash' && order.status !== 'Paid' ? (
                      <button onClick={() => handleSettlePayment(order.id)} className="flex-1 bg-[#00D161] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <DollarSign size={16}/> Settle Cash
                      </button>
                    ) : (
                      <div className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center border border-emerald-100">
                        <span>PAID ONLINE</span>
                        <span className="opacity-60 text-[8px] italic uppercase">via {order.payment_method}</span>
                      </div>
                    )}
                    <button onClick={() => printReceipt(order)} className="py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all shadow-sm">
                      <Printer size={18}/>
                    </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Billing;