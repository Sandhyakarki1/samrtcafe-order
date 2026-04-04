import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; 
import { 
  LayoutDashboard, Users, UtensilsCrossed, 
  ClipboardList, MessageSquare, QrCode, ReceiptText,
  LogOut, Bell, ChevronDown, User, Settings, Lock
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Get admin data from storage
  const adminUser = JSON.parse(localStorage.getItem("admin_user")) || { username: "Admin" };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Staff', path: '/admin/staff', icon: <Users size={20} /> },
    { name: 'Menu', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
    { name: 'Feedback', path: '/admin/feedback', icon: <MessageSquare size={20} /> },
    { name: 'QR Code', path: '/admin/qrcode', icon: <QrCode size={20} /> },
    { name: 'Billing', path: '/admin/billing', icon: <ReceiptText size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_user"); 
    navigate("/admin/login");
  };

  // Close dropdown when clicking anywhere else
  useEffect(() => {
    const closeDropdown = () => setIsProfileOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col z-40 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight italic">Smart-cafe</h2>
          <div className="mt-1">
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest">
              Admin Portal
            </span>
          </div>
        </div>

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
      </aside>

      {/* --- MAIN SECTION --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ✅ THE TOP HEADER BAR */}
        <header className="bg-white border-b border-slate-100 h-20 flex items-center justify-between px-8 z-30 shadow-sm">
          <div>
            <h2 className="text-slate-800 font-bold text-sm uppercase tracking-widest">
              System Management
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Monitoring café operations in real-time</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
               <Bell size={20} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* --- ADMIN AVATAR HUB (Right Side) --- */}
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                className="flex items-center gap-3 p-1.5 pr-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all active:scale-95"
              >
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-indigo-100 shadow-lg">
                  {adminUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black text-slate-800 leading-none">{adminUser.username}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Super Admin</p>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-50 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Account</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{adminUser.email || 'admin@smartcafe.com'}</p>
                  </div>
                  
                  <button className="flex items-center gap-3 px-5 py-2.5 w-full text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 text-sm font-bold transition-all text-left">
                    <User size={16}/> Profile
                  </button>
                  <button className="flex items-center gap-3 px-5 py-2.5 w-full text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 text-sm font-bold transition-all text-left">
                    <Settings size={16}/> Settings
                  </button>
                  
                  <div className="border-t border-slate-50 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-5 py-3 w-full text-red-500 hover:bg-red-50 text-sm font-black transition-all text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;