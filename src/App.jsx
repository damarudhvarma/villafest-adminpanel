import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AdminProvider } from "./context/AdminContext";

function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AdminProvider>
  );
}

export default App;
