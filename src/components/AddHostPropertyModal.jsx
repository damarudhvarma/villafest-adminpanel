import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hostAxiosInstance } from "@/axios/axios";
import { useToast } from "./ui/use-toast";
import MapComponent from "./GoogleMap";

const AddHostPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    weekendPrice: "",
    description: "",
    rules: [],
    amenities: [],
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    maxGuests: "",
    owner: {
      name: "",
      contact: "",
    },
  });
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [customAmenities, setCustomAmenities] = useState(""); // New state for custom amenities

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchAmenities();
    }
  }, [isOpen]);

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

  const fetchCategories = async () => {
    try {
      const response = await hostAxiosInstance.get("/categories");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories",
      });
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await hostAxiosInstance.get("/amenities");
      if (response.data.success) {
        setAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch amenities",
      });
    }
  };

  const createMarker = useCallback((map, position) => {
    try {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }

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

        result.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number"))
            streetNumber = component.long_name;
          if (types.includes("route")) route = component.long_name;
          if (types.includes("locality")) city = component.long_name;
          if (types.includes("administrative_area_level_1"))
            state = component.long_name;
          if (types.includes("postal_code")) postalCode = component.long_name;
        });

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

  const initializeMap = useCallback(() => {
    const mapElement = document.getElementById("map");
    if (mapElement && !mapRef.current && window.google) {
      let initialCenter = { lat: 14.5995, lng: 120.9842 };
      let initialZoom = 11;

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

      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          createMarker(map, { lat, lng });
        }
      }

      map.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));

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
    if (isOpen && isMapLoaded) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (!isOpen) {
        mapRef.current = null;
      }
    };
  }, [isOpen, isMapLoaded, initializeMap]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "propertyOwnerName" || name === "propertyOwnerContact") {
      setFormData((prev) => ({
        ...prev,
        owner: {
          ...prev.owner,
          [name === "propertyOwnerName" ? "name" : "contact"]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Maximum 10 additional images allowed",
      });
      return;
    }
    setAdditionalImages(files);
  };

  const handleAmenityChange = (amenityId) => {
    setFormData((prev) => {
      const currentAmenities = prev.amenities;
      const newAmenities = currentAmenities.includes(amenityId)
        ? currentAmenities.filter((id) => id !== amenityId)
        : [...currentAmenities, amenityId];
      return {
        ...prev,
        amenities: newAmenities,
      };
    });
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  const handleRemoveRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }));
  };

  const handleLocationSelect = useCallback((location) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) {
        const place = results[0];
        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let postalCode = "";

        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number"))
            streetNumber = component.long_name;
          if (types.includes("route")) route = component.long_name;
          if (types.includes("locality")) city = component.long_name;
          if (types.includes("administrative_area_level_1"))
            state = component.long_name;
          if (types.includes("postal_code")) postalCode = component.long_name;
        });

        setFormData((prev) => ({
          ...prev,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
          address: streetNumber
            ? `${streetNumber} ${route}`
            : route || place.formatted_address,
          city,
          state,
          postalCode,
        }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate owner data
    if (!formData.owner.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property owner name is required",
      });
      setIsLoading(false);
      return;
    }

    const contactNumber = Number(formData.owner.contact);
    if (isNaN(contactNumber) || contactNumber <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid contact number",
      });
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Create a copy of formData to modify
      const dataToSend = {
        ...formData,
        owner: {
          name: formData.owner.name.trim(),
          contact: contactNumber,
        },
      };

      // Process custom amenities
      let customAmenitiesArray = [];
      if (customAmenities.trim()) {
        customAmenitiesArray = customAmenities
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // Append all form fields
      Object.keys(dataToSend).forEach((key) => {
        if (key === "rules" || key === "owner") {
          formDataToSend.append(key, JSON.stringify(dataToSend[key]));
        } else if (key === "amenities") {
          // Include both selected amenities and custom amenities
          formDataToSend.append(
            key,
            JSON.stringify({
              selected: dataToSend[key],
              custom: customAmenitiesArray,
            })
          );
        } else {
          formDataToSend.append(key, dataToSend[key]);
        }
      });

      // Append images
      if (mainImage) {
        formDataToSend.append("mainImage", mainImage);
      }
      additionalImages.forEach((image) => {
        formDataToSend.append("additionalImages", image);
      });

      const response = await hostAxiosInstance.post(
        "/host-properties/create-host-property",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Property added successfully",
        });
        onPropertyAdded();
        onClose();
        // Reset form
        setFormData({
          title: "",
          category: "",
          price: "",
          weekendPrice: "",
          description: "",
          rules: [],
          amenities: [],
          latitude: "",
          longitude: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          maxGuests: "",
          owner: {
            name: "",
            contact: "",
          },
        });
        setMainImage(null);
        setAdditionalImages([]);
        setCustomAmenities("");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add property",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Check if we're in the process of selecting a place
        const isSelectingPlace =
          document.querySelector(".pac-container")?.style.display !== "none" ||
          document.activeElement?.classList.contains("search-input");

        if (!open && isSelectingPlace) {
          return;
        }
        onClose();
      }}
    >
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on the search suggestions
          if (
            e.target.closest(".pac-container") ||
            e.target.closest(".search-input")
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill in the property details. Click on the map to set the location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="propertyOwnerName">Property Owner Name</Label>
              <Input
                id="propertyOwnerName"
                name="propertyOwnerName"
                value={formData.owner.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="propertyOwnerContact">
                Property Owner Contact
              </Label>
              <Input
                id="propertyOwnerContact"
                name="propertyOwnerContact"
                type="number"
                value={formData.owner.contact}
                onChange={handleInputChange}
                required
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <Label htmlFor="price">Regular Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="weekendPrice">Weekend Price</Label>
              <Input
                id="weekendPrice"
                name="weekendPrice"
                type="number"
                value={formData.weekendPrice}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="maxGuests">Maximum Guests</Label>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                value={formData.maxGuests}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>

          {/* Rules */}
          <div>
            <Label>Property Rules</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add a rule"
              />
              <Button type="button" onClick={handleAddRule}>
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1">{rule}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.map((amenity) => (
                <div key={amenity._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={amenity._id}
                    checked={formData.amenities.includes(amenity._id)}
                    onChange={() => handleAmenityChange(amenity._id)}
                  />
                  <Label htmlFor={amenity._id}>{amenity.name}</Label>
                </div>
              ))}
            </div>

            {/* Custom Amenities */}
            <div className="mt-4">
              <Label htmlFor="customAmenities">Custom Amenities</Label>
              <Textarea
                id="customAmenities"
                placeholder="Enter additional amenities separated by commas (e.g., Coffee maker, BBQ grill, Board games)"
                value={customAmenities}
                onChange={(e) => setCustomAmenities(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div>
              <Label>Location</Label>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <MapComponent
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      formData.latitude && formData.longitude
                        ? {
                            lat: parseFloat(formData.latitude),
                            lng: parseFloat(formData.longitude),
                          }
                        : null
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
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
                    name="address"
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
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="mainImage">Main Image</Label>
              <Input
                id="mainImage"
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="additionalImages">
                Additional Images (max 10)
              </Label>
              <Input
                id="additionalImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding Property..." : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHostPropertyModal;
