import React from 'react';
import { NavLink, Outlet } from 'react-router-dom'; 
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, // Used for Menu
  ClipboardList,   // Used for Orders
  MessageSquare,   // Used for Feedback
  QrCode           // Used for QR Code
} from 'lucide-react';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col z-30 shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight">Smart-cafe</h2>
          <div className="mt-1">
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-bold">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-4 space-y-2">
          {/* DASHBOARD LINK */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="font-medium text-sm">Dashboard</span>
          </NavLink>

          {/* STAFF LINK */}
          <NavLink
            to="/admin/staff"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Users size={20} />
            <span className="font-medium text-sm">Staff</span>
          </NavLink>

          {/* MENU MANAGEMENT LINK - Added this! */}
          <NavLink
            to="/admin/menu"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <UtensilsCrossed size={20} />
            <span className="font-medium text-sm">Menu</span>
          </NavLink>

          {/* ORDERS LINK (For later) */}
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <ClipboardList size={20} />
            <span className="font-medium text-sm">Orders</span>
          </NavLink>

          {/* FEEDBACK LINK (For later) */}
          <NavLink
            to="/admin/feedback"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <MessageSquare size={20} />
            <span className="font-medium text-sm">Feedback</span>
          </NavLink>

          {/* QR CODE LINK (For later) */}
          <NavLink
            to="/admin/qrcode"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-[#22c55e] text-white shadow-lg' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <QrCode size={20} />
            <span className="font-medium text-sm">QR Code</span>
          </NavLink>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
        {/* Your MenuManagement.jsx or StaffManagement.jsx will render here */}
        <div className="max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;