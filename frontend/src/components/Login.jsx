import React, { useState } from "react";
import { loginUser } from "../api/userApi.js";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone || !password) {
      alert("Please enter both phone and password.");
      return;
    }

    try {
      const userData = { phone, password };
      const response = await loginUser(userData);
      console.log("Login response:", response);

      if (response && response.user && response.user._id) {
        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify(response.user));

        // Navigate to chat or dashboard
        navigate(`/chat/${response.user.name}`);
      } else {
        alert("Invalid login credentials");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
