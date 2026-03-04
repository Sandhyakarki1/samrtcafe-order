// src/pages/ForgotPassword.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setMessage("");
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/admin/forgot-password/", { email });
      setMessage(res.data.message);

      // Redirect to Reset Password page with email
      navigate("/admin/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || "Error sending OTP");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Enter your admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-6 border rounded"
          required
        />
        <button
          onClick={handleSendOTP}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
