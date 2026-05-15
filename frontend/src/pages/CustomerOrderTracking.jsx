import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, ChefHat, Bell, Star, Send, MessageSquare, Utensils } from "lucide-react";


const BASE_URL = "https://call-combination-instead-ranging.trycloudflare.com";

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
      if (order?.status !== 'Served' && order?.status !== 'Paid' && !submitted) fetchOrder();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold uppercase text-xs">Connecting to Kitchen...</div>;
  if (!order) return <div className="p-20 text-center text-red-500 font-black">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {order.status !== 'Served' && order.status !== 'Paid' && !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md text-center">
          <h1 className="text-2xl font-black text-slate-800 mb-2">Order Tracking</h1>
          <p className="text-indigo-600 font-bold mb-8 italic">Order ID: #{order.id}</p>
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              {order.status === 'Pending' && <Clock size={48} className="animate-pulse" />}
              {order.status === 'Preparing' && <ChefHat size={48} className="animate-bounce" />}
              {order.status === 'Ready' && <Bell size={48} className="animate-bounce text-emerald-500" />}
            </div>
          </div>
          <h2 className="text-4xl font-black uppercase text-slate-800 mb-2">{order.status}</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase mb-8 tracking-widest">Table {order.table_number}</p>
          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Your Items</p>
            <p className="font-bold text-slate-700 italic text-sm leading-relaxed">{order.items_text}</p>
          </div>
        </div>
      ) : !submitted ? (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-700">
          <h2 className="text-2xl font-black text-center text-slate-800">Enjoy your meal!</h2>
          <p className="text-center text-slate-400 text-sm mt-1 mb-8 italic">How was your experience at Table {order.table_number}?</p>
          <form onSubmit={handleFeedbackSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onClick={() => setRating(n)}><Star size={36} fill={n <= rating ? "#fbbf24" : "none"} stroke={n <= rating ? "#fbbf24" : "#cbd5e1"} className="transition-transform active:scale-125"/></button>)}
            </div>
            <textarea className="w-full bg-slate-50 border-0 rounded-[24px] p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none" placeholder="Share your thoughts with us..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all">Submit Review</button>
          </form>
        </div>
      ) : (
        <div className="text-center animate-in zoom-in">
           <MessageSquare size={64} className="text-indigo-600 mx-auto mb-6"/>
           <h1 className="text-3xl font-black text-slate-800">Thank You!</h1>
           <button onClick={() => navigate(`/menu/${order.table_number}`)} className="mt-10 text-indigo-600 font-black border-b-4 border-indigo-100 pb-1 uppercase text-xs tracking-widest">Order Something Else?</button>
        </div>
      )}
    </div>
  );
}