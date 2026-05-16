import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, ChefHat, Bell, Star, MessageSquare, CheckCircle, Wallet, Loader2 } from "lucide-react";

const BASE_URL = "https://philosophy-serious-grateful-implementation.trycloudflare.com";

export default function CustomerOrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${id}/`);
      if (response.ok) setOrder(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      if (order?.status !== 'Served' && !submitted) fetchOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [id, order?.status, submitted]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/api/feedback/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: id, rating, comment })
    });
    if (res.ok) setSubmitted(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold uppercase text-[10px] tracking-widest text-slate-400">Syncing with Kitchen...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-black">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* --- VIEW 1: LIVE TRACKING (Pending, Preparing, Ready) --- */}
      {order.status !== 'Served' && !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center animate-in zoom-in duration-500">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8">Live Status</p>
          
          <div className="flex justify-center mb-10">
            <div className="w-28 h-28 bg-indigo-600 rounded-[35px] flex items-center justify-center text-white shadow-2xl relative">
              {order.status === 'Pending' && <Clock size={48} className="animate-pulse" />}
              {order.status === 'Preparing' && <ChefHat size={48} className="animate-bounce" />}
              {order.status === 'Ready' && <Bell size={48} className="animate-bounce text-yellow-300" />}
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{order.status}</h2>
          <p className="text-slate-400 text-sm mb-10">Table {order.table_number} • Order #{order.id}</p>
          
          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Order Items</p>
            <p className="font-bold text-slate-700 italic text-sm">{order.items_text}</p>
          </div>
        </div>

      /* --- VIEW 2: FEEDBACK + CASH PAYMENT INSTRUCTION  --- */
      ) : !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-700 text-left">
          
          {/* CASH PAYMENT NOTICE: Only shows if method was 'cash' */}
          {order.payment_method?.toLowerCase() === 'cash' && (
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl mb-8 flex items-start gap-4">
                <Wallet className="text-amber-600 mt-1" size={24} />
                <div>
                    <p className="font-black text-amber-900 text-sm uppercase tracking-tight">Payment Reminder</p>
                    <p className="text-amber-700 text-xs mt-1">Please settle your bill of <span className="font-bold">Rs. {order.total_price}</span> at the counter. Thank you!</p>
                </div>
            </div>
          )}

          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Food Served! 🍽️</h2>
          <p className="text-slate-500 text-sm mt-1 mb-8 font-medium italic">How was your meal at SmartCafe?</p>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={32} fill={n <= rating ? "#fbbf24" : "none"} stroke={n <= rating ? "#fbbf24" : "#cbd5e1"} className="transition-all active:scale-150"/>
                </button>
              ))}
            </div>
            <textarea 
                className="w-full bg-slate-50 border-0 rounded-[24px] p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none" 
                placeholder="Write your review here..." 
                value={comment} onChange={(e) => setComment(e.target.value)} 
            />
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
              Submit Review
            </button>
          </form>
        </div>

      /* --- VIEW 3: THANK YOU SCREEN --- */
      ) : (
        <div className="text-center animate-in zoom-in duration-500">
           <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6"/>
           <h1 className="text-4xl font-black text-slate-800">Thank You!</h1>
           <p className="text-slate-400 font-medium mt-2 italic">Visit us again soon!</p>
           <button onClick={() => navigate(`/menu/${order.table_number}`)} className="mt-12 bg-white px-8 py-4 rounded-2xl font-black text-indigo-600 shadow-sm border border-slate-100 hover:shadow-md transition-all active:scale-95 text-xs uppercase tracking-widest">Order Something Else</button>
        </div>
      )}
    </div>
  );
}