import React, { useState, useEffect } from 'react';
import { Users, Utensils, ClipboardList, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_staff: 0, total_menu: 0, total_orders: 0, pending_orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]); // State for alerts

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Stats
      const statsRes = await fetch("http://127.0.0.1:8000/api/stats/");
      const statsData = await statsRes.json();
      
      // 2. Fetch Orders for Recent Activity
      const ordersRes = await fetch("http://127.0.0.1:8000/api/orders/");
      const ordersData = await ordersRes.json();

      // 3. Fetch Menu to check for Low Stock Alerts
      const menuRes = await fetch("http://127.0.0.1:8000/api/menu/");
      const menuData = await menuRes.json();

      setStats({
        total_staff: statsData.total_staff,
        total_menu: statsData.total_menu,
        total_orders: statsData.total_orders,
        pending_orders: statsData.pending_orders
      });
      
      setRecentOrders(ordersData.slice(0, 5));
      
      // Filter items with stock less than 5 but more than 0
      setLowStockItems(menuData.filter(item => item.stock < 5));
      
    } catch (err) {
      console.error("Dashboard sync error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen font-sans">
      {/* 1. HEADER (Button Removed) */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 font-medium mt-1">Welcome back, Sandhya</p>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users className="text-blue-600"/>} label="Total Staff" value={stats.total_staff} />
        <StatCard icon={<Utensils className="text-emerald-500"/>} label="Menu Items" value={stats.total_menu} />
        <StatCard icon={<ClipboardList className="text-indigo-600"/>} label="Total Orders" value={stats.total_orders} />
        <StatCard icon={<Clock className="text-orange-500"/>} label="Pending" value={stats.pending_orders} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. RECENT ACTIVITY TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Recent Activity</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b">
                  <th className="pb-4 px-4">Order ID</th>
                  <th className="pb-4 px-4">Table</th>
                  <th className="pb-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4 font-bold text-slate-700">Order #{order.id}</td>
                    <td className="py-5 px-4 font-bold text-slate-400">Table {order.table_number}</td>
                    <td className="py-5 px-4">
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

        {/* 4. NEW: INVENTORY ALERT SECTION */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-500/20 text-red-400 rounded-xl">
                   <AlertTriangle size={20} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest">Inventory Alerts</h2>
              </div>
              
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-slate-100">{item.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-red-400 font-black text-xs bg-red-400/10 px-2 py-1 rounded-lg">
                          {item.stock === 0 ? "Out of Stock" : `${item.stock} Left`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic text-center py-10">All stock levels are healthy.</p>
                )}
                
                <button 
                  onClick={() => window.location.href='/admin/menu'}
                  className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Manage Inventory <ArrowRight size={12}/>
                </button>
              </div>
           </div>
           {/* Abstract Background Glow */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:scale-110 transition-all shadow-inner">{icon}</div>
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Live</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="text-4xl font-black text-slate-800 tracking-tighter">{value}</div>
  </div>
);

export default AdminDashboard;