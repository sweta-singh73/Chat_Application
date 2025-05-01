import React, { useState } from "react";
import { loginUser } from "../api/userApi.js";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("Login button clicked");
    if (!name || !email) {
      alert("Please enter both name and email.");
      return;
    }

    try {
      const userData = { name, email };
      const user = await loginUser(userData);
      console.log("User response:", user.user._id);

      if (user && user.user && user.user._id) {
        // Save to local storage
        localStorage.setItem("user", JSON.stringify(user.user));

        // Navigate to chat page
        navigate(`/chat/${user.user.name}`);
      } else {
        console.error("Invalid login response:", user);
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login or Register</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
