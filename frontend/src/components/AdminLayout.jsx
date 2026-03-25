import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; 
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  ClipboardList,   
  MessageSquare,   
  QrCode,
  LogOut
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();

  // 1. Centralized Menu Items Array
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Staff', path: '/admin/staff', icon: <Users size={20} /> },
    { name: 'Menu', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
    { name: 'Feedback', path: '/admin/feedback', icon: <MessageSquare size={20} /> },
    { name: 'QR Code', path: '/admin/qrcode', icon: <QrCode size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_user"); // Clear login session
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col z-30 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight">Smart-cafe</h2>
          <div className="mt-1">
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-black tracking-widest">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="flex-1 px-3 mt-6 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#22c55e] text-white shadow-lg shadow-green-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard, Staff, Menu, Orders, or Feedback will render here */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout; 