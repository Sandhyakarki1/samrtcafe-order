// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth & Password Pages
import AdminLogin from "./pages/AdminLogin.jsx";
import StaffLogin from "./pages/StaffLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

// Admin Pages
import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import MenuManagement from "./pages/Menumanagement.jsx"; 
import Orders from "./pages/Orders.jsx";

// Staff Dashboards
import KitchenDashboard from './pages/KitchenDashboard';
import WaiterDashboard from './pages/WaiterDashboard';

// Customer Pages
import CustomerMenu from "./pages/CustomerMenu.jsx";  
import CustomerCart from "./pages/CustomerCart.jsx";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";
import FeedbackManagement from "./pages/FeedbackManagement.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* ==========================================
            AUTH ROUTES
           ========================================== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* ==========================================
            ADMIN PANEL (With Sidebar Layout)
           ========================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<Orders />} /> 
          <Route path="feedback" element={<FeedbackManagement />} />
        </Route>

        {/* ==========================================
            STAFF DASHBOARDS
           ========================================== */}
        <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
        <Route path="/waiter/dashboard" element={<WaiterDashboard />} />

        {/* ==========================================
            CUSTOMER ROUTES
           ========================================== */}
        {/* ✅ FIX 1: Allow /menu (for query params) and /menu/1 (for params) */}
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        
        <Route path="/cart" element={<CustomerCart />} />
        
        {/* ✅ FIX 2: Match your navigation! 
            Changed from /order-status/:orderId to /track/:id 
            because your Cart page does: navigate(`/track/${id}`) */}
        <Route path="/track/:id" element={<CustomerOrderTracking />} />


        {/* ==========================================
            REDIRECTS
           ========================================== */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h1 className="text-9xl font-black text-slate-200">404</h1>
            <p className="text-xl font-bold text-slate-500 -mt-10">Page Not Found</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 text-indigo-600 font-bold border-b-2 border-indigo-600"
            >
              Go to Homepage
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;