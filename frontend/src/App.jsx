import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Chat from "./components/Chat";
import RegisterPage from "./components/Register";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:userId" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
