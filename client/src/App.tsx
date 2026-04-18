import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Panel from "./pages/Panel";
import Reports from "./pages/Reports";
import { useState } from "react";

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" />;
  const isAdmin = user.role === "admin" || (!user.role && user.username === "admin");
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => {}} />} />
        <Route path="/panel" element={<Panel />} />
        <Route
          path="/"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />
        <Route
          path="/reports"
          element={<PrivateRoute adminOnly><Reports /></PrivateRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
