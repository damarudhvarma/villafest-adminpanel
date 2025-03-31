import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
import ListingsTable from "./ListingsTable";
import ReservationsTable from "./ReservationsTable";
import CategoriesTable from "./CategoriesTable";
import HostsTable from "./HostsTable";
import CouponsTable from "./CouponsTable";
import HostPropertiesTable from "./HostPropertiesTable";
import UsersTable from "./UsersTable.jsx";
import BannersTable from "./BannersTable";
import { AdminContext } from "@/context/AdminContext";
import { axiosinstance } from "@/axios/axios";
import { Switch } from "@/components/ui/switch";
import { CookingPot } from "lucide-react";
import AmenitiesTable from "./AmenitiesTable";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import AddPropertyModal from "./AddPropertyModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { Admin, setAdmin } = useContext(AdminContext);
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Listings");
  const [categories, setCategories] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    weekendPrice: "",
    description: "",
    rules: "",
    amenities: "",
    latitude: "",
    longitude: "",
    address: "",
    ownerName: "",
    ownerContact: "",
    city: "",
    state: "",
    postalCode: "",
    isActive: true,
    maxGuests: "",
  });
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [openAmenities, setOpenAmenities] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      const response = await axiosinstance.get("/admin/profile");
      setAdmin(response.data.data);
    };
    if (Admin === null) {
      fetchAdmin();
    }
  }, []);

  useEffect(() => {
    fetchTotalProperties();
  }, []);

  useEffect(() => {
    if (
      !window.google &&
      !document.querySelector('script[src*="maps.googleapis.com"]')
    ) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places,marker,geocoding`;
      script.async = true;
      script.onload = () => setIsMapLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setIsMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const createMarker = useCallback((map, position) => {
    try {
      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

      // Create new marker using standard Marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: "Selected Location",
        animation: window.google.maps.Animation.DROP,
      });

      markerRef.current = marker;
    } catch (error) {
      console.error("Error creating marker:", error);
    }
  }, []);

  const updateAddressFromCoordinates = useCallback(async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat, lng },
      });

      if (response.results[0]) {
        const result = response.results[0];
        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let postalCode = "";

        // Extract address components
        result.address_components.forEach((component) => {
          const types = component.types;

          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          }
          if (types.includes("route")) {
            route = component.long_name;
          }
          if (types.includes("locality")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (types.includes("postal_code")) {
            postalCode = component.long_name;
          }
        });

        // Update form data with address details
        setFormData((prev) => ({
          ...prev,
          address: streetNumber ? `${streetNumber} ${route}` : route,
          city,
          state,
          postalCode,
        }));
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  }, []);

  // Update the coordinate change effect
  useEffect(() => {
    if (mapRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };

        // Center the map on the coordinates
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(15);

        // Create or update the marker
        createMarker(mapRef.current, position);

        // Update address details
        updateAddressFromCoordinates(lat, lng);
      }
    }
  }, [
    formData.latitude,
    formData.longitude,
    createMarker,
    updateAddressFromCoordinates,
  ]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleActiveToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        title: formData.title,
        category: formData.category,
        price: Number(formData.price),
        weekendPrice: Number(formData.weekendPrice),
        description: formData.description,
        rules: formData.rules
          .split(",")
          .map((rule) => rule.trim())
          .filter(Boolean),
        amenities: selectedAmenities.map((amenity) => amenity._id),
        maxGuests: Number(formData.maxGuests),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        address: formData.address,
        ownerName: formData.ownerName,
        ownerContact: formData.ownerContact,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        isActive: formData.isActive,
      };

      const response = await axiosinstance.post(
        "/properties/add-property",
        formattedData
      );

      if (response.data.success) {
        setIsAddPropertyOpen(false);
        setFormData({
          title: "",
          category: "",
          price: "",
          weekendPrice: "",
          description: "",
          rules: "",
          amenities: "",
          latitude: "",
          longitude: "",
          address: "",
          ownerName: "",
          ownerContact: "",
          city: "",
          state: "",
          postalCode: "",
          isActive: true,
          maxGuests: "",
        });
        setSelectedAmenities([]);
        // Refresh the properties list
        fetchTotalProperties();
      }
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  const initializeMap = useCallback(() => {
    const mapElement = document.getElementById("map");
    if (mapElement && !mapRef.current && window.google) {
      // Default center (you can change this to any default location)
      let initialCenter = { lat: 14.5995, lng: 120.9842 };
      let initialZoom = 11;

      // If coordinates are provided, use them
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          initialCenter = { lat, lng };
          initialZoom = 17;
        }
      }

      const map = new window.google.maps.Map(mapElement, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: "cooperative",
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
      });
      mapRef.current = map;

      // Create initial marker if coordinates exist
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          createMarker(map, { lat, lng });
        }
      }

      // Add click listener to map
      map.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Update form data with clicked coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));

        // Update marker and address
        createMarker(map, { lat, lng });
        updateAddressFromCoordinates(lat, lng);
      });
    }
  }, [
    formData.latitude,
    formData.longitude,
    createMarker,
    updateAddressFromCoordinates,
  ]);

  useEffect(() => {
    if (isAddPropertyOpen && isMapLoaded) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (!isAddPropertyOpen) {
        mapRef.current = null;
      }
    };
  }, [isAddPropertyOpen, isMapLoaded, initializeMap]);

  const fetchCategories = async () => {
    try {
      const response = await axiosinstance.get("/categories");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTotalProperties = async () => {
    try {
      const response = await axiosinstance.get("/properties/get-properties");
      if (response.data.success) {
        setTotalProperties(response.data.properties.length);
      }
    } catch (error) {
      console.error("Error fetching total properties:", error);
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await axiosinstance.get("/amenities");
      if (response.data.success) {
        setAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Listings":
        return (
          <ListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
      case "Reservations":
        return <ReservationsTable />;
      case "Categories":
        return <CategoriesTable />;
      case "Amenities":
        return <AmenitiesTable />;
      case "Hosts":
        return <HostsTable />;
      case "Coupons":
        return <CouponsTable />;
      case "Host Properties":
        return <HostPropertiesTable />;
      case "Users":
        return <UsersTable />;
      case "Banners":
        return <BannersTable />;
      default:
        return (
          <ListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("Token");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Add a check for Admin
  if (!Admin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Welcome back, {Admin?.name || "Admin"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-white">
                {(Admin?.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline">{Admin?.name || "Admin"}</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg border border-indigo-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600">Total Properties</p>
              <h3 className="text-2xl font-bold text-indigo-900 mt-1">
                {totalProperties}
              </h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Active Reservations</p>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1">12</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-white rounded-lg border border-violet-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-violet-900 mt-1">
                ₹24,500
              </h3>
            </div>
            <div className="bg-violet-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600">Occupancy Rate</p>
              <h3 className="text-2xl font-bold text-amber-900 mt-1">85%</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
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
            onClick={() => setActiveTab("Reservations")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Reservations"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Reservations
          </button>
          <button
            onClick={() => setActiveTab("Categories")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Categories"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Categories
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
            onClick={() => setActiveTab("Hosts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Hosts"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Hosts
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
            onClick={() => setActiveTab("Host Properties")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Host Properties"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Host Properties
          </button>
          <button
            onClick={() => setActiveTab("Users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Users"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("Banners")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "Banners"
                ? "bg-[#0f172a] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Banners
          </button>
        </div>

        {renderContent()}
      </div>

      <AddPropertyModal
        isOpen={isAddPropertyOpen}
        onClose={() => setIsAddPropertyOpen(false)}
        onSuccess={handleSubmit}
      />
    </div>
  );
};

export default Dashboard;
