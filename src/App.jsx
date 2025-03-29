import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AdminProvider } from "./context/AdminContext";
import { HostProvider } from "./context/HostContext";

function App() {
  return (
    <Router>
      <AdminProvider>
        <HostProvider>
          <div className="min-h-screen bg-gray-100">
            <AppRoutes />
          </div>
        </HostProvider>
      </AdminProvider>
    </Router>
  );
}

export default App;
