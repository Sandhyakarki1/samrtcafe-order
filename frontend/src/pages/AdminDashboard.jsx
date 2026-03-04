import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Users, Utensils, ClipboardList } from "lucide-react";

function AdminDashboard() {
  const adminUser = JSON.parse(localStorage.getItem("admin_user"));
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalStaff: 0,
    totalMenu: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Staff Count
      const staffRes = await fetch("http://127.0.0.1:8000/api/staff/");
      const staffData = await staffRes.json();

      // 2. Fetch Menu Count
      const menuRes = await fetch("http://127.0.0.1:8000/api/menu/");
      const menuData = await menuRes.json();

      // 3. Fetch Orders (Assuming you have this endpoint, otherwise keep as 0 for now)
      // const ordersRes = await fetch("http://127.0.0.1:8000/api/orders/");
      // const ordersData = await ordersRes.json();

      setStats({
        totalOrders: 0, // Update later when Order API is ready
        pendingOrders: 0,
        totalStaff: staffData.length,
        totalMenu: menuData.length,
      });

      // Dummy data for Recent Orders until you build the Order History UI
      setRecentOrders([
        { id: 3, table: "Table 3", status: "Preparing", color: "text-blue-600 bg-blue-50" },
        { id: 1, table: "Table 1", status: "Pending", color: "text-orange-600 bg-orange-50" },
      ]);

    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  if (!adminUser) return <Navigate to="/admin/login" />;

  return (
    <div className="animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1 font-medium">Welcome back, {adminUser.username}</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} /> Create Staff Account
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Staff" value={stats.totalStaff} icon={<Users className="text-blue-600" />} />
        <Card title="Menu Items" value={stats.totalMenu} icon={<Utensils className="text-emerald-600" />} />
        <Card title="Total Orders" value={stats.totalOrders} icon={<ClipboardList className="text-indigo-600" />} />
        <Card title="Pending" value={stats.pendingOrders} icon={<div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />} />
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Order ID</th>
              <th className="px-8 py-4">Table</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-700">Order #{order.id}</td>
                <td className="px-8 py-5 text-slate-600 font-medium">{order.table}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${order.color}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable Card Component for Dashboard
const Card = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Live</span>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
    <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
  </div>
);

export default AdminDashboard;