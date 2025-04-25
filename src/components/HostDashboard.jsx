import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import HostListingsTable from "./HostListingsTable";
import HostCouponsTable from "./HostCouponsTable";
import HostAmenitiesTable from "./HostAmenitiesTable";
import HostReservationsTable from "./HostReservationsTable";
import { HostContext } from "@/context/HostContext";
import { hostAxiosInstance } from "@/axios/axios";
import AddPropertyModal from "./AddPropertyModal";
import { useToast } from "../components/ui/use-toast";

const HostDashboard = () => {
  const navigate = useNavigate();
  const { Host, setHost } = useContext(HostContext);
  const { toast } = useToast();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Listings");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const response = await hostAxiosInstance.get("/hosts/profile");

        if (response.data.success) {
          setHost(response.data.data);
        } else {
          throw new Error("Failed to fetch host profile");
        }
      } catch (error) {
        console.error("Error fetching host profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("HostToken");
          navigate("/host-login");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch host profile. Please try again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    const token = localStorage.getItem("HostToken");
    if (!token) {
      navigate("/host-login");
    }
    fetchHost();
  }, [navigate, setHost, toast]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("HostToken");
      setHost(null);
      navigate("/host-login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Listings":
        return (
          <HostListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
      case "Amenities":
        return <HostAmenitiesTable />;
      case "Coupons":
        return <HostCouponsTable />;
      case "Reservations":
        return <HostReservationsTable />;
      default:
        return (
          <HostListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  // if (!host) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900 mb-4">
  //           Access Denied
  //         </h1>
  //         <p className="text-gray-600">Please login to access the dashboard.</p>
  //         <Button onClick={() => navigate("/host-login")} className="mt-4">
  //           Go to Login
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Welcome back, {Host?.fullName || "Host"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white">
                {(Host?.fullName || "H").charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">
                {Host?.fullName || "Host"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("Listings")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Listings"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab("Amenities")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Amenities"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Amenities
          </button>
          <button
            onClick={() => setActiveTab("Coupons")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Coupons"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab("Reservations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Reservations"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Reservations
          </button>
        </div>

        {renderContent()}
      </div>

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
      />
    </div>
  );
};

export default HostDashboard;
