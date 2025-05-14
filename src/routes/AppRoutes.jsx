import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../screens/Login";
import Dashboard from "@/components/Dashboard";
import AdminAuth from "@/auth/AdminAuth";
import HostDashboard from "@/components/HostDashboard";
import Hostlogin from "@/components/Hostlogin";
import SSOLogin from "@/components/SSOLoginComponent";
import HostAuth from "@/auth/HostAuth";
;

function AppRoutes() {
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
      <Route path="/host-login" element={<Hostlogin />} />
      <Route path="/auth/sso-login" element={<SSOLogin />} />
      <Route
        path="/host-dashboard"
        element={
          <HostAuth>
            <HostDashboard />
          </HostAuth>
        
        }
      />
    </Routes>
  );
}

export default AppRoutes;
