// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import StaffManagement from "./pages/StaffManagement.jsx";
import MenuManagement from "./pages/Menumanagement.jsx";
import Orders from "./pages/Orders.jsx";
import CustomerMenu from "./pages/CustomerMenu.jsx";  
import CustomerCart from "./pages/CustomerCart.jsx";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes (No Sidebar) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* Admin Dashboard Section (With Sidebar) */}
        {/* We wrap everything in AdminLayout so the sidebar stays on the screen */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default redirect: /admin -> /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* These paths become /admin/dashboard and /admin/staff */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" elements={<Orders />} />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        <Route path="/track/:id" element={<CustomerOrderTracking />} />
        <Route path="/menu" element={<CustomerMenu />} />
<Route path="/cart" element={<CustomerCart />} />


      </Routes>
    </Router>
  );
}

export default App;