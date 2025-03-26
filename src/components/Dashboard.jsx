import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ListingsTable from "./ListingsTable";
import ReservationsTable from "./ReservationsTable";
import CategoriesTable from "./CategoriesTable";
import HostsTable from "./HostsTable";
import CouponsTable from "./CouponsTable";
import HostPropertiesTable from "./HostPropertiesTable";
import UsersTable from "./UsersTable.jsx";
import { AdminContext } from "@/context/AdminContext";
import axiosinstance from "@/axios/axios";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Listings");
  const [categories, setCategories] = useState([]);
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
  });
  const { Admin } = useContext(AdminContext);

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
        amenities: formData.amenities
          .split(",")
          .map((amenity) => amenity.trim())
          .filter(Boolean),
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
        });
        // You might want to refresh the properties list here
        // fetchProperties();
      }
    } catch (error) {
      console.error("Error creating property:", error);
      // You might want to show an error message to the user here
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
          initialZoom = 15;
        }
      }

      const map = new window.google.maps.Map(mapElement, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;

      // Create initial marker if coordinates exist
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          createMarker(map, { lat, lng });
          updateAddressFromCoordinates(lat, lng);
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

        // Update address details
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
      case "Hosts":
        return <HostsTable />;
      case "Coupons":
        return <CouponsTable />;
      case "Host Properties":
        return <HostPropertiesTable />;
      case "Users":
        return <UsersTable />;
      default:
        return (
          <ListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Welcome back, {Admin.name}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Properties</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">24</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
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

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Reservations</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">12</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
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

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">$24,500</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
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

        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">85%</h3>
            </div>
            <div className="bg-orange-50 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-orange-600"
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
        </div>

        {renderContent()}
      </div>

      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill in the property details. Click on the map to set the
              location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter property title"
                  className="h-8"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="price">Regular Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter regular price"
                  className="h-8"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="weekendPrice">Weekend Price</Label>
                <Input
                  id="weekendPrice"
                  type="number"
                  placeholder="Enter weekend price"
                  className="h-8"
                  value={formData.weekendPrice}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter property description"
                className="h-16"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="rules">Property Rules</Label>
              <Textarea
                id="rules"
                placeholder="Enter property rules separated by commas (e.g., No smoking, No pets, Check-in time)"
                className="h-16"
                value={formData.rules}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="amenities">Amenities</Label>
              <Textarea
                id="amenities"
                placeholder="Enter property amenities separated by commas (e.g., WiFi, Pool, Parking)"
                className="h-16"
                value={formData.amenities}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ownerName">Owner's Name</Label>
                <Input
                  id="ownerName"
                  placeholder="Enter owner's name"
                  className="h-8"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ownerContact">Owner's Contact</Label>
                <Input
                  id="ownerContact"
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  className="h-8"
                  value={formData.ownerContact}
                  onChange={(e) => {
                    // Only allow numbers and limit to 10 digits
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10);
                    setFormData((prev) => ({
                      ...prev,
                      ownerContact: value,
                    }));
                  }}
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter a valid 10-digit mobile number
                </p>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="Enter latitude"
                    className="h-8"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="Enter longitude"
                    className="h-8"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter street address"
                  className="h-8"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    className="h-8"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    className="h-8"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="Enter postal code"
                    className="h-8"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Map Preview</Label>
              <div
                id="map"
                className="w-full h-[250px] bg-gray-100 rounded-md"
                style={{ border: "1px solid #e2e8f0" }}
              >
                {!isMapLoaded && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Click on the map to set the property location
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveToggle}
              />
              <Label htmlFor="isActive">Property Active Status</Label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPropertyOpen(false)}
                className="h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white h-8"
              >
                Add Property
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
