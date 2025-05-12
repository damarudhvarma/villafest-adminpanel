import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hostAxiosInstance } from "@/axios/axios";

import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { HostContext } from "@/context/HostContext";
import { auth, provider } from "@/firebase";
import { signInWithPopup } from "firebase/auth";

const Hostlogin = () => {
  const navigate = useNavigate();
  const { setHost } = useContext(HostContext);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await hostAxiosInstance.post("/hosts/login", formData);

      if (response.data.success) {
        const { authToken, host } = response.data.data;
        console.log(response.data.data);

        localStorage.setItem("HostToken", authToken);

        setHost(host);

        toast({
          title: "Success",
          description: "Login successful! Welcome back.",
        });

        navigate("/host-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        if (
          error.response?.data?.message === "Your account has been deactivated"
        ) {
          toast({
            variant: "destructive",
            title: "Account Deactivated",
            description:
              "Your account has been deactivated. Please contact support for assistance.",
          });
        } else {
          setError(
            error.response?.data?.message || "Invalid email or password"
          );
        }
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user) throw new Error("No user returned from Google");
      const idToken = await user.getIdToken();
      const email = user.email;
      // Send idToken and email to backend
      const response = await hostAxiosInstance.post("/hosts/firebase-login", {
        idToken,
        email,
      });
      if (response.data.success) {
        const { authToken, host } = response.data.data;
        localStorage.setItem("HostToken", authToken);
        setHost(host);
        toast({
          title: "Success",
          description: "Login successful! Welcome back.",
        });
        navigate("/host-dashboard");
      } else {
        setError("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred during Google login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Host Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0f172a] focus:border-[#0f172a] sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0f172a] focus:border-[#0f172a] sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f172a]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
          <div className="my-4 flex items-center justify-center">
            <span className="text-gray-400 text-sm">or</span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 px-4 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Gmail
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hostlogin;
