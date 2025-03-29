import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../screens/Login";
import Dashboard from "@/components/Dashboard";
import AdminAuth from "@/auth/AdminAuth";
import HostDashboard from "@/components/HostDashboard";
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminAuth>
            <Dashboard />
          </AdminAuth>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/host-dashboard" element={<HostDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
