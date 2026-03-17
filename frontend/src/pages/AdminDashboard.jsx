import React, { useState, useEffect } from 'react';
import { Users, Utensils, ClipboardList, Clock, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_staff: 0, total_menu: 0, total_orders: 0, pending_orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  // --- Fetch data from Django ---
  const fetchDashboardData = async () => {
    try {
    
      const statsRes = await fetch("http://127.0.0.1:8000/api/stats/");
      const statsData = await statsRes.json();
      
      // Get Recent Orders list
      const ordersRes = await fetch("http://127.0.0.1:8000/api/orders/");
      const ordersData = await ordersRes.json();

      setStats({
        total_staff: statsData.total_staff || 2, // Defaulting if not in API yet
        total_menu: statsData.total_menu || 2,
        total_orders: statsData.total_orders,
        pending_orders: statsData.pending_orders
      });
      
      // Only show the top 5 newest orders in the "Recent Activity" section
      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error("Dashboard sync error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-400 font-medium">Welcome back, Sandhya</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-transform active:scale-95">
          <Plus size={20} /> Create Staff Account
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={<Users className="text-blue-600"/>} label="Total Staff" value={stats.total_staff} />
        <StatCard icon={<Utensils className="text-emerald-500"/>} label="Menu Items" value={stats.total_menu} />
        <StatCard icon={<ClipboardList className="text-indigo-600"/>} label="Total Orders" value={stats.total_orders} />
        <StatCard icon={<Clock className="text-orange-500"/>} label="Pending" value={stats.pending_orders} />
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Recent Activity</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b">
              <th className="pb-4">Order ID</th>
              <th className="pb-4">Table</th>
              <th className="pb-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentOrders.map((order) => (
              <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-5 font-bold text-slate-700">Order #{order.id}</td>
                <td className="py-5 font-bold text-slate-400">Table {order.table_number}</td>
                <td className="py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                    order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentOrders.length === 0 && <p className="text-center py-10 text-slate-300 font-bold italic">No recent activity found.</p>}
      </div>
    </div>
  );
};

// Sub component for cards
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:scale-110 transition-all">{icon}</div>
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Live</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="text-4xl font-black text-slate-800 tracking-tighter">{value}</div>
  </div>
);

export default AdminDashboard;