import React, { useState, useRef, useCallback, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import axiosinstance from "@/axios/axios";

const AddPropertyModal = ({ isOpen, onClose, onSuccess }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
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
    mainImage: null,
    additionalImages: [],
  });

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
    fetchAmenities();
  }, []);

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

  useEffect(() => {
    if (mapRef.current && formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };
        mapRef.current.setCenter(position);
        mapRef.current.setZoom(15);
        createMarker(mapRef.current, position);
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
        mainImage: formData.mainImage,
        additionalImages: formData.additionalImages,
      };

      const response = await axiosinstance.post(
        "/properties/add-property",
        formattedData
      );

      if (response.data.success) {
        onClose();
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
          mainImage: null,
          additionalImages: [],
        });
        setSelectedAmenities([]);
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill in the property details. Click on the map to set the location.
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
            <Label>Amenities</Label>
            <Select
              value={
                selectedAmenities.length > 0
                  ? selectedAmenities[selectedAmenities.length - 1]._id
                  : ""
              }
              onValueChange={(value) => {
                const selectedAmenity = amenities.find((a) => a._id === value);
                if (
                  selectedAmenity &&
                  !selectedAmenities.some((a) => a._id === value)
                ) {
                  setSelectedAmenities((prev) => [...prev, selectedAmenity]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select amenities" />
              </SelectTrigger>
              <SelectContent>
                {amenities.map((amenity) => (
                  <SelectItem key={amenity._id} value={amenity._id}>
                    {amenity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedAmenities.map((amenity, index) => (
                <div
                  key={amenity._id}
                  className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                >
                  <span>{amenity.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAmenities((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="maxGuests">Maximum Guests Allowed</Label>
            <Input
              id="maxGuests"
              type="number"
              min="1"
              placeholder="Enter maximum number of guests"
              className="h-8"
              value={formData.maxGuests}
              onChange={handleInputChange}
              required
            />
          </div>

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

          <div className="grid gap-1.5">
            <Label>Location</Label>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="locationSearch">Search Location</Label>
                <div className="relative">
                  <Input
                    id="locationSearch"
                    type="text"
                    placeholder="Type to search for a location..."
                    className="h-8"
                    onFocus={(e) => {
                      if (!window.google) return;

                      const autocomplete =
                        new window.google.maps.places.Autocomplete(e.target, {
                          types: ["geocode", "establishment"],
                          fields: [
                            "formatted_address",
                            "geometry",
                            "name",
                            "address_components",
                          ],
                        });

                      if (mapRef.current) {
                        autocomplete.bindTo("bounds", mapRef.current);
                      }

                      autocomplete.addListener("place_changed", () => {
                        const place = autocomplete.getPlace();

                        if (!place.geometry?.location) {
                          console.error("No location data for this place");
                          return;
                        }

                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();

                        setFormData((prev) => ({
                          ...prev,
                          latitude: lat.toString(),
                          longitude: lng.toString(),
                        }));

                        let streetNumber = "";
                        let route = "";
                        let city = "";
                        let state = "";
                        let postalCode = "";

                        place.address_components?.forEach((component) => {
                          const types = component.types;
                          if (types.includes("street_number"))
                            streetNumber = component.long_name;
                          if (types.includes("route"))
                            route = component.long_name;
                          if (types.includes("locality"))
                            city = component.long_name;
                          if (types.includes("administrative_area_level_1"))
                            state = component.long_name;
                          if (types.includes("postal_code"))
                            postalCode = component.long_name;
                        });

                        setFormData((prev) => ({
                          ...prev,
                          address: streetNumber
                            ? `${streetNumber} ${route}`
                            : route || place.name || place.formatted_address,
                          city,
                          state,
                          postalCode,
                        }));

                        if (mapRef.current) {
                          const newPosition = { lat, lng };
                          mapRef.current.setCenter(newPosition);
                          mapRef.current.setZoom(17);

                          if (markerRef.current) {
                            markerRef.current.setMap(null);
                          }

                          const marker = new window.google.maps.Marker({
                            position: newPosition,
                            map: mapRef.current,
                            title: "Selected Location",
                            animation: window.google.maps.Animation.DROP,
                          });

                          markerRef.current = marker;
                          mapRef.current.panTo(newPosition);
                        }
                      });
                    }}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Search for a location and select from the suggestions to
                  automatically update the map and coordinates
                </p>
              </div>
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

          <div className="grid gap-1.5">
            <Label>Main Property Image</Label>
            <div className="grid gap-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="mainImage"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  {formData.mainImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(formData.mainImage)}
                        alt="Main property"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData((prev) => ({
                            ...prev,
                            mainImage: null,
                          }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (MAX. 2MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="mainImage"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size <= 2 * 1024 * 1024) {
                        // 2MB limit
                        setFormData((prev) => ({
                          ...prev,
                          mainImage: file,
                        }));
                      } else {
                        alert("File size should be less than 2MB");
                      }
                    }}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Additional Images (Optional)</Label>
            <div className="grid gap-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="additionalImages"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 2MB each)
                    </p>
                  </div>
                  <input
                    id="additionalImages"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const validFiles = files.filter(
                        (file) => file.size <= 2 * 1024 * 1024
                      );
                      if (validFiles.length !== files.length) {
                        alert(
                          "Some files were skipped as they exceed 2MB size limit"
                        );
                      }
                      setFormData((prev) => ({
                        ...prev,
                        additionalImages: [
                          ...(prev.additionalImages || []),
                          ...validFiles,
                        ],
                      }));
                    }}
                  />
                </label>
              </div>
              {formData.additionalImages &&
                formData.additionalImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.additionalImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              additionalImages: prev.additionalImages.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
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
              onClick={onClose}
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
  );
};

export default AddPropertyModal;
