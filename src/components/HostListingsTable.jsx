import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { hostAxiosInstance } from "@/axios/axios";
import AddHostPropertyModal from "./AddHostPropertyModal";
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import MapComponent from "./GoogleMap";

const HostListingsTable = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
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
    rooms: "",
    owner: {
      name: "",
      contact: "",
    },
  });
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [newRule, setNewRule] = useState("");
  const [customAmenities, setCustomAmenities] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchCategories();
    fetchAmenities();
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

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await hostAxiosInstance.get("/host-properties");
      if (response.data) {
        setProperties(response.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleAddProperty = () => {
    setIsAddModalOpen(true);
  };

  const handlePropertyAdded = () => {
    fetchProperties();
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
    setEditFormData({
      title: property.title,
      price: property.price,
      weekendPrice: property.weekendPrice,
      description: property.description,
      rules: property.rules || [],
      amenities: property.amenities?.map((a) => a._id) || [],
      latitude: property.location?.coordinates[1] || "",
      longitude: property.location?.coordinates[0] || "",
      address: property.address?.street || "",
      city: property.address?.city || "",
      state: property.address?.state || "",
      postalCode: property.address?.postalCode || "",
      maxGuests: property.maxGuests,
      rooms: property.rooms,
      owner: {
        name: property.owner?.name || "",
        contact: property.owner?.contact || "",
      },
    });
    setCustomAmenities(property.customAmenities?.join(", ") || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    // Validate owner data
    if (!editFormData.owner.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Property owner name is required",
      });
      return;
    }

    const contactNumber = Number(editFormData.owner.contact);
    if (isNaN(contactNumber) || contactNumber <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid contact number",
      });
      return;
    }

    // Validate form data
    if (!editFormData.rooms || editFormData.rooms < 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Number of rooms is required and must be at least 1",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      // Create a copy of formData to modify
      const dataToSend = {
        ...editFormData,
        owner: {
          name: editFormData.owner.name.trim(),
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

      const response = await hostAxiosInstance.put(
        `/host-properties/${editingProperty._id}`,
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
          description: "Property updated successfully",
        });
        setIsEditModalOpen(false);
        fetchProperties();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "propertyOwnerName" || name === "propertyOwnerContact") {
      setEditFormData((prev) => ({
        ...prev,
        owner: {
          ...prev.owner,
          [name === "propertyOwnerName" ? "name" : "contact"]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
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
    setEditFormData((prev) => {
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
      setEditFormData((prev) => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  const handleRemoveRule = (index) => {
    setEditFormData((prev) => ({
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

        setEditFormData((prev) => ({
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

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">My Properties</h2>
        <Button
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto"
          onClick={handleAddProperty}
        >
          <span className="mr-2">+</span>
          Add Property
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search properties..."
          className="w-full sm:max-w-md border-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Title
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Regular Price
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Weekend Price
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                More Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan="6"
                  className="text-center text-gray-500 py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProperties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="6"
                  className="text-center text-gray-500 py-8"
                >
                  No properties found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProperties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>₹{property.price}</TableCell>
                  <TableCell>₹{property.weekendPrice}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        property.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : property.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.status.charAt(0).toUpperCase() +
                        property.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(property)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(property)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="grid gap-4 py-4">
              {/* Images Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-2">
                    Main Image
                  </h3>
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}${
                        selectedProperty.mainImage
                      }`}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {selectedProperty.additionalImages?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">
                      Additional Images
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedProperty.additionalImages.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={`${import.meta.env.VITE_SERVER_URL}${image}`}
                            alt={`${selectedProperty.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Title</h3>
                  <p>{selectedProperty.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Category
                  </h3>
                  <p>{selectedProperty.category?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Regular Price
                  </h3>
                  <p>₹{selectedProperty.price}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Weekend Price
                  </h3>
                  <p>₹{selectedProperty.weekendPrice}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Status</h3>
                  <p>
                    {selectedProperty.status.charAt(0).toUpperCase() +
                      selectedProperty.status.slice(1)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Maximum Guests
                  </h3>
                  <p>{selectedProperty.maxGuests} guests</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Number of Rooms
                  </h3>
                  <p>
                    {selectedProperty.rooms || "Not specified"}{" "}
                    {selectedProperty.rooms === 1 ? "room" : "rooms"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Description
                </h3>
                <p className="mt-1">{selectedProperty.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">Address</h3>
                <p className="mt-1">
                  {selectedProperty.address.street},{" "}
                  {selectedProperty.address.city},{" "}
                  {selectedProperty.address.state}{" "}
                  {selectedProperty.address.postalCode}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">Rules</h3>
                <ul className="mt-1 list-disc list-inside">
                  {selectedProperty.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Owner Details
                </h3>
                <p className="mt-1">
                  Name: {selectedProperty.owner.name}
                  <br />
                  Contact: {selectedProperty.owner.contact}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">Location</h3>
                <p className="mt-1">
                  Latitude: {selectedProperty.location.coordinates[1]},<br />
                  Longitude: {selectedProperty.location.coordinates[0]}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Property Modal */}
      <AddHostPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      {/* Edit Property Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the property details. Click on the map to set the location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  name="rooms"
                  type="number"
                  min="1"
                  value={editFormData.rooms}
                  onChange={handleEditInputChange}
                  required
                  placeholder="Enter number of rooms"
                />
                <p className="text-xs text-gray-500">Minimum 1 room required</p>
              </div>
              <div>
                <Label htmlFor="propertyOwnerName">Property Owner Name</Label>
                <Input
                  id="propertyOwnerName"
                  name="propertyOwnerName"
                  value={editFormData.owner.name}
                  onChange={handleEditInputChange}
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
                  value={editFormData.owner.contact}
                  onChange={handleEditInputChange}
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
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="weekendPrice">Weekend Price</Label>
                <Input
                  id="weekendPrice"
                  name="weekendPrice"
                  type="number"
                  value={editFormData.weekendPrice}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxGuests">Maximum Guests</Label>
                <Input
                  id="maxGuests"
                  name="maxGuests"
                  type="number"
                  value={editFormData.maxGuests}
                  onChange={handleEditInputChange}
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
                value={editFormData.description}
                onChange={handleEditInputChange}
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
                {editFormData.rules.map((rule, index) => (
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
                      checked={editFormData.amenities.includes(amenity._id)}
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
                        editFormData.latitude && editFormData.longitude
                          ? {
                              lat: parseFloat(editFormData.latitude),
                              lng: parseFloat(editFormData.longitude),
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
                        value={editFormData.latitude}
                        onChange={handleEditInputChange}
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
                        value={editFormData.longitude}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={editFormData.city}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={editFormData.state}
                        onChange={handleEditInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={editFormData.postalCode}
                        onChange={handleEditInputChange}
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
                />
                {editingProperty?.mainImage && !mainImage && (
                  <div className="mt-2">
                    <img
                      src={`${import.meta.env.VITE_SERVER_URL}${
                        editingProperty.mainImage
                      }`}
                      alt="Current main image"
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
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
                {editingProperty?.additionalImages?.length > 0 &&
                  !additionalImages.length && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {editingProperty.additionalImages.map((image, index) => (
                        <img
                          key={index}
                          src={`${import.meta.env.VITE_SERVER_URL}${image}`}
                          alt={`Additional image ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HostListingsTable;
