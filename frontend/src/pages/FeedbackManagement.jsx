import React, { useState, useEffect } from 'react';
import { Star, Quote, MessageSquare } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/feedback/")
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error("Error fetching feedback:", err));
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Customer Feedback</h1>
      <p className="text-slate-500 mb-10 font-medium">Real-time reviews from your tables</p>

      {feedbacks.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[40px] border border-dashed text-slate-300">
           <MessageSquare size={48} className="mx-auto mb-4" />
           <p className="font-bold uppercase tracking-widest">No feedback received yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 relative group hover:border-indigo-200 transition-all">
              <Quote className="absolute top-6 right-8 text-slate-50 w-16 h-16 group-hover:text-indigo-50 transition-colors" />
              
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star 
                    key={n} 
                    size={16} 
                    fill={n <= f.rating ? "#fbbf24" : "none"} 
                    stroke={n <= f.rating ? "#fbbf24" : "#e2e8f0"} 
                  />
                ))}
              </div>

              {/* The Comment */}
              <p className="text-slate-700 font-bold italic text-lg leading-relaxed mb-8 relative z-10 min-h-[60px]">
                "{f.comment || 'No comment provided'}"
              </p>

              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                 <div>
                    {/* FIXED: Using table_number and order */}
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Table {f.table_number}</p>
                    <p className="text-xs font-bold text-slate-800">Order #{f.order}</p>
                 </div>
                 {/* FIXED: Using formatted_date */}
                 <span className="text-[10px] font-bold text-slate-300 uppercase">{f.formatted_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;