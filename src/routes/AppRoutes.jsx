import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../screens/Login";
import Dashboard from "@/components/Dashboard";
import AdminAuth from "@/auth/AdminAuth";

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
    </Routes>
  );
};

export default AppRoutes;
