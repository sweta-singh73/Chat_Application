import React, { useState } from "react";
import { loginUser } from "../api/userApi.js";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userData = { name, email };
      const user = await loginUser(userData);
      // Navigate to the chat page upon successful login
      navigate(`/chat/${user.user._id}`);
    } catch (error) {
      console.error("Login failed", error);
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
