import React, { useState, useEffect } from 'react';
import { Star, Quote, MessageSquare } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  // --- 1. IMPROVED NEPAL TIME LOGIC ---
  const formatNepalTime = (f) => {
    // Try to find the date in any common field name
    const rawDate = f.created_at || f.timestamp || f.formatted_date || f.date;

    if (!rawDate) return "Just now";
    
    try {
      const dateObj = new Date(rawDate);
      
      // If it's a valid date object, convert to Nepal Time (+5:45)
      if (!isNaN(dateObj.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(dateObj);
      }
      return rawDate;
    } catch (e) {
      return rawDate; 
    }
  };

  const fetchFeedback = () => {
    fetch("http://127.0.0.1:8000/api/feedback/")
      .then(res => res.json())
      .then(data => {
        // --- 2. SORTING LOGIC: Newest ID First ---
        const sortedData = data.sort((a, b) => b.id - a.id);
        setFeedbacks(sortedData);
      })
      .catch(err => console.error("Error fetching feedback:", err));
  };

  useEffect(() => {
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tighter italic uppercase">Customer Feedback</h1>
      <p className="text-slate-500 mb-10 font-medium uppercase text-[10px] tracking-widest">Real-time reviews from your tables</p>

      {feedbacks.length === 0 ? (
        <div className="bg-white p-20 text-center rounded-[40px] border border-dashed text-slate-200">
           <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
           <p className="font-black uppercase tracking-widest text-xs">No feedback received yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((f) => (
            <div key={f.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 relative group hover:border-indigo-200 transition-all hover:-translate-y-1 duration-300">
              <Quote className="absolute top-6 right-8 text-slate-50 w-16 h-16 group-hover:text-indigo-50 transition-colors" />
              
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star 
                    key={n} 
                    size={14} 
                    fill={n <= f.rating ? "#fbbf24" : "none"} 
                    stroke={n <= f.rating ? "#fbbf24" : "#e2e8f0"} 
                  />
                ))}
              </div>

              {/* The Comment */}
              <p className="text-slate-700 font-bold italic text-lg leading-relaxed mb-8 relative z-10 min-h-[60px]">
                "{f.comment || 'No comment provided'}"
              </p>

              <div className="flex justify-between items-end pt-6 border-t border-slate-50">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                    <div className="flex items-center gap-2">
                       <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md">T{f.table_number}</span>
                       <span className="text-xs font-bold text-slate-800 uppercase">Order #{f.order}</span>
                    </div>
                 </div>
                 
                 {/* UPDATED NEPAL TIME DISPLAY */}
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Time (NST)</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                       {formatNepalTime(f)}
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;