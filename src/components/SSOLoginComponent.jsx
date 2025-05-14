import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // If using React Router v6
import { hostAxiosInstance } from "../axios/axios";

const SSOLogin = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const performSSOLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!token) {
        setError("No token provided.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await hostAxiosInstance.post(
          "/api/sso/validate-token",
          { token }
        );

        if (data.adminToken) {
          localStorage.setItem("HostToken", data.adminToken);
          navigate("/host-dashboard");
        } else {
          setError(data.message || "SSO login failed.");
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            "Something went wrong during SSO login."
        );
      } finally {
        setLoading(false);
      }
    };

    performSSOLogin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl font-semibold animate-pulse">
          Logging you in...
        </div>
      </div>
    );
  }

  if (error) {
    navigate("/host-login");
  }

  return null; // You will never reach this because of the redirects
};

export default SSOLogin;
