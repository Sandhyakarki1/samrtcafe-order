import React, { useState, useEffect } from 'react';
import { CheckCircle, DollarSign, Printer, Receipt, Search, History, ArrowLeft } from 'lucide-react';

// Change this to your current Cloudflare link
const BASE_URL = "https://groundwater-baking-timing-scsi.trycloudflare.com";

const Billing = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("pending"); // "pending" or "history"

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 10 seconds to catch new "Served" orders
    const interval = setInterval(fetchOrders, 10000); 
    return () => clearInterval(interval);
  }, [view]); // Refetch when view changes

  const fetchOrders = async () => {
    try {
      // If history view, fetch Paid orders. Otherwise fetch all to filter Served.
      const typeParam = view === "history" ? "?type=history" : "";
      const res = await fetch(`${BASE_URL}/api/orders/${typeParam}`);
      const data = await res.json();
      
      if (view === "pending") {
        setOrders(data.filter(o => o.status === 'Served'));
      } else {
        setOrders(data); // History already filtered by backend
      }
    } catch (err) {
      console.error("Billing fetch error:", err);
    }
  };

  const handleSettlePayment = async (orderId) => {
    if (!window.confirm("Confirm Cash Received? This Table will be cleared.")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Paid" })
      });

      if (res.ok) {
        alert("Payment Successful! Order moved to history.");
        fetchOrders();
      }
    } catch (err) {
      alert("Connection error.");
    }
  };

  // Custom Print Function for Professional Receipt
  const printReceipt = (order) => {
    const net = (order.total_price / 1.13).toFixed(2);
    const vat = (order.total_price - net).toFixed(2);

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; font-size: 14px; }
            .text-center { text-align: center; }
            .hr { border-bottom: 1px dashed #000; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2 class="text-center">SMART-CAFE</h2>
          <p class="text-center">Date: ${new Date().toLocaleString()}</p>
          <div class="hr"></div>
          <p>Table: ${order.table_number}</p>
          <p>Order ID: #${order.id}</p>
          <div class="hr"></div>
          <p class="bold">ITEMS:</p>
          ${order.items_text.split(',').map(item => `<div class="flex"><span>${item.trim()}</span></div>`).join('')}
          <div class="hr"></div>
          <div class="flex"><span>Net Amount:</span><span>Rs. ${net}</span></div>
          <div class="flex"><span>VAT (13%):</span><span>Rs. ${vat}</span></div>
          <div class="flex bold" style="font-size: 18px; margin-top: 10px;">
            <span>TOTAL:</span><span>Rs. ${order.total_price}</span>
          </div>
          <div class="hr"></div>
          <p class="text-center">Thank You! Visit Again.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter logic
  const filteredOrders = orders.filter(o => o.table_number.toString().includes(searchTerm));

  return (
    <div className="p-8 bg-[#fcfcfd] min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {view === "pending" ? "Billing Counter" : "Billing History"}
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            {view === "pending" ? "Finalize cash settlements" : "Review past transactions"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mr-4">
            <button 
              onClick={() => setView("pending")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "pending" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setView("history")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "history" ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
            >
              History
            </button>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-300"/>
              <input 
                type="text" 
                placeholder="Table #..." 
                className="outline-none text-sm font-bold w-24" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOrders.length === 0 ? (
           <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <Receipt size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1}/>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                {view === "pending" ? "No pending bills at the moment" : "No history found"}
              </p>
           </div>
        ) : (
          filteredOrders.map((order) => {
            const grandTotal = parseFloat(order.total_price);
            const netAmount = grandTotal / 1.13;
            const vatAmount = grandTotal - netAmount;

            return (
              <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-xl border border-white relative overflow-hidden group transition-all hover:shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">{order.table_number}</div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order #{order.id}</p>
                    <p className={`text-[10px] font-black uppercase flex items-center gap-1 justify-end ${order.status === 'Paid' ? 'text-blue-500' : 'text-emerald-500'}`}>
                       <CheckCircle size={10}/> {order.status}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Items list</p>
                   <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-4 border-indigo-100 pl-3">{order.items_text}</p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 font-mono border-2 border-dashed border-slate-200 text-xs">
                    <div className="flex justify-between mb-2 text-slate-500"><span>Net Amount:</span><span>Rs. {netAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-4 text-slate-500"><span>VAT (13%):</span><span>Rs. {vatAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-900 font-black text-xl border-t border-slate-200 pt-4"><span>Total:</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
                </div>

                <div className="flex gap-2">
                    {order.status !== 'Paid' && (
                      <button 
                        onClick={() => handleSettlePayment(order.id)} 
                        className="flex-1 bg-[#00D161] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign size={16}/> Settle Cash
                      </button>
                    )}
                    <button 
                      onClick={() => printReceipt(order)} 
                      className={`py-4 px-6 rounded-2xl transition-all flex items-center justify-center ${order.status === 'Paid' ? 'bg-indigo-600 text-white w-full' : 'bg-slate-100 text-slate-400'}`}
                    >
                      <Printer size={18}/> {order.status === 'Paid' && <span className="ml-2 font-bold text-xs uppercase">Reprint Bill</span>}
                    </button>
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