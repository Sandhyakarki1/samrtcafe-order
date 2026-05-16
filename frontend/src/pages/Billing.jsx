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
      const typeParam = view === "history" ? "?type=history" : "";
      const res = await fetch(`${BASE_URL}/api/orders/${typeParam}`);
      const data = await res.json();
      
      if (view === "pending") {
        // --- 1. FILTER: Show only orders NOT yet 'Paid' ---
        const pendingOnly = data.filter(o => o.status !== 'Paid');
        
        // --- 2. SORT: Newest Order ID first (Latest on top) ---
        const sorted = pendingOnly.sort((a, b) => b.id - a.id);
        setOrders(sorted);
      } else {
        // History shows PAID orders, also sorted by Latest ID
        const historySorted = data.sort((a, b) => b.id - a.id);
        setOrders(historySorted);
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
        alert("Cash Settled! Order moved to History.");
        fetchOrders();
      }
    } catch (err) { alert("Error connecting to server."); }
  };

  const printReceipt = (order) => {
    const method = (order.payment_method || 'CASH').toUpperCase();
    const net = (order.total_price / 1.13).toFixed(2);
    const vat = (order.total_price - net).toFixed(2);
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; font-size: 14px; }
            .center { text-align: center; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .hr { border-bottom: 1px dashed #000; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h2 class="center">SMART-CAFE</h2>
          <p class="center">${new Date().toLocaleString()}</p>
          <div class="hr"></div>
          <div class="flex"><span>Table: ${order.table_number}</span><span>ID: #${order.id}</span></div>
          <p>Method: ${method}</p>
          <div class="hr"></div>
          ${order.items_text.split(',').map(item => `<div class="flex"><span>${item.trim()}</span></div>`).join('')}
          <div class="hr"></div>
          <div class="flex"><span>Net Amount:</span><span>Rs. ${net}</span></div>
          <div class="flex"><span>VAT (13%):</span><span>Rs. ${vat}</span></div>
          <div class="flex bold"><span>TOTAL:</span><span>Rs. ${order.total_price}</span></div>
          <div class="hr"></div>
          <p class="center italic">Thank You!</p>
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
            {view === "pending" ? "Newest orders are shown at the top" : "Completed transactions"}
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
             const isOnline = order.payment_method?.toLowerCase() === 'esewa' || order.payment_method?.toLowerCase() === 'khalti';

             return (
              <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-white relative transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                  <div className="text-right">
                    <span className={`flex items-center gap-1 justify-end text-[10px] font-black uppercase mb-1 ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                       {isOnline ? <CreditCard size={12}/> : <Banknote size={12}/>} 
                       {order.payment_method || 'CASH'}
                    </span>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'Paid' ? 'text-blue-500' : 'text-emerald-500'}`}>
                       {order.status}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                   <p className="text-sm font-bold text-slate-700 italic border-l-4 border-indigo-100 pl-3 leading-relaxed">{order.items_text}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 font-mono border-2 border-dashed border-slate-200">
                    <div className="flex justify-between text-slate-900 font-black text-xl italic"><span>Total:</span><span>Rs. {order.total_price}</span></div>
                </div>

                <div className="flex gap-2">
                    {/* BUTTON LOGIC: Settle Cash only if unpaid */}
                    {order.status !== 'Paid' ? (
                      <button onClick={() => handleSettlePayment(order.id)} className="flex-1 bg-[#00D161] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                        <DollarSign size={16}/> Settle Cash
                      </button>
                    ) : (
                      <div className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center border border-emerald-100">
                        <span>PAID SUCCESSFULLY</span>
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
      
      {orders.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 mx-auto max-w-xl">
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No orders in this section.</p>
        </div>
      )}
    </div>
  );
};

export default Billing;