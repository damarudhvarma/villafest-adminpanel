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
import { axiosinstance } from "@/axios/axios";
import { Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MapComponent from "./GoogleMap";

const ListingsTable = ({ onAddProperty }) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
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
    rooms: "",
    mainImage: null,
    additionalImages: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProperties();
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

  const fetchProperties = async () => {
    try {
      const response = await axiosinstance.get("/properties/get-properties");

      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleEditClick = (property) => {
    if (property.host) {
      toast({
        title: "Error",
        description:
          "This property cannot be edited as it is already assigned to a host",
        variant: "destructive",
      });
      return;
    }

    setEditingProperty(property);
    setEditFormData({
      title: property.title,
      price: property.price,
      weekendPrice: property.weekendPrice,
      description: property.description,
      rules: property.rules.join("\n"),
      maxGuests: property.maxGuests,
      rooms: property.rooms,
      latitude: property.location?.coordinates[1] || "",
      longitude: property.location?.coordinates[0] || "",
      address: property.address?.street || "",
      ownerName: property.owner?.name || "",
      ownerContact: property.owner?.contact || "",
      city: property.address?.city || "",
      state: property.address?.state || "",
      postalCode: property.address?.postalCode || "",
      isActive: property.isActive,
    });
    setSelectedAmenities(property.amenities || []);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();

      // Append all the regular fields
      formDataToSend.append("title", editFormData.title);
      formDataToSend.append("price", Number(editFormData.price));
      formDataToSend.append("weekendPrice", Number(editFormData.weekendPrice));
      formDataToSend.append("description", editFormData.description);
      formDataToSend.append(
        "rules",
        JSON.stringify(
          editFormData.rules
            .split("\n")
            .map((rule) => rule.trim())
            .filter(Boolean)
        )
      );
      formDataToSend.append(
        "amenities",
        JSON.stringify(selectedAmenities.map((amenity) => amenity._id))
      );
      formDataToSend.append("maxGuests", Number(editFormData.maxGuests));
      formDataToSend.append("rooms", Number(editFormData.rooms));
      formDataToSend.append("latitude", Number(editFormData.latitude));
      formDataToSend.append("longitude", Number(editFormData.longitude));
      formDataToSend.append("address", editFormData.address);
      formDataToSend.append("ownerName", editFormData.ownerName);
      formDataToSend.append("ownerContact", editFormData.ownerContact);
      formDataToSend.append("city", editFormData.city);
      formDataToSend.append("state", editFormData.state);
      formDataToSend.append("postalCode", editFormData.postalCode);
      formDataToSend.append("isActive", editFormData.isActive);

      // Append the main image if it's a new file
      if (editFormData.mainImage instanceof File) {
        formDataToSend.append("mainImage", editFormData.mainImage);
      }

      // Append additional images if they're new files
      if (editFormData.additionalImages?.length > 0) {
        editFormData.additionalImages.forEach((image) => {
          if (image instanceof File) {
            formDataToSend.append("additionalImages", image);
          }
        });
      }

      const response = await axiosinstance.put(
        `/properties/${editingProperty._id}`,
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
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Property Management</h2>
        <Button
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto"
          onClick={onAddProperty}
        >
          <span className="mr-2">+</span>
          Add Property
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Filter listings..."
          className="w-full sm:max-w-md border-gray-300"
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
            {properties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="6"
                  className="text-center text-gray-500 py-8"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>₹{property.price}</TableCell>
                  <TableCell>₹{property.weekendPrice}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        property.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
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
                      {!property.host && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditClick(property)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
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
              {/* Add Images Section */}
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

                {selectedProperty.additionalImages &&
                  selectedProperty.additionalImages.length > 0 && (
                    <div>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Additional Images
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedProperty.additionalImages.map(
                          (image, index) => (
                            <div
                              key={index}
                              className="aspect-square rounded-lg overflow-hidden"
                            >
                              <img
                                src={`${
                                  import.meta.env.VITE_SERVER_URL
                                }${image}`}
                                alt={`${selectedProperty.title} - ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Existing Property Details */}
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
                  <p>{selectedProperty.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Maximum Guests
                  </h3>
                  <p>{selectedProperty.maxGuests} guests</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Owner Name
                  </h3>
                  <p>{selectedProperty.owner.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Owner Contact
                  </h3>
                  <p>{selectedProperty.owner.contact}</p>
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
                <h3 className="font-medium text-sm text-gray-500">Amenities</h3>
                <ul className="mt-1 list-disc list-inside">
                  {selectedProperty.amenities.map((amenity) => (
                    <li key={amenity._id}>{amenity.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">Location</h3>
                <p className="mt-1">
                  Latitude: {selectedProperty.location.coordinates[1]},
                  Longitude: {selectedProperty.location.coordinates[0]}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the property details. Click on the map to set the location.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  name="rooms"
                  type="number"
                  min="1"
                  value={editFormData.rooms}
                  onChange={(e) => {
                    const value = Math.max(1, parseInt(e.target.value) || 1);
                    setEditFormData((prev) => ({
                      ...prev,
                      rooms: value,
                    }));
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
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
              <div className="grid gap-1.5">
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
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="rules">Property Rules</Label>
              <Textarea
                id="rules"
                name="rules"
                value={editFormData.rules}
                onChange={handleEditInputChange}
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
                  const selectedAmenity = amenities.find(
                    (a) => a._id === value
                  );
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
                name="maxGuests"
                type="number"
                min="1"
                value={editFormData.maxGuests}
                onChange={(e) => {
                  const value = Math.max(1, parseInt(e.target.value) || 1);
                  setEditFormData((prev) => ({
                    ...prev,
                    maxGuests: value,
                  }));
                }}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="mb-3">Location</Label>
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

            <div className="grid gap-1.5">
              <Label>Main Property Image</Label>
              <div className="grid gap-3">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="mainImage"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    {editFormData.mainImage ? (
                      <div className="relative w-full h-full">
                        <img
                          src={
                            editFormData.mainImage instanceof File
                              ? URL.createObjectURL(editFormData.mainImage)
                              : `${import.meta.env.VITE_SERVER_URL}${
                                  editingProperty?.mainImage
                                }`
                          }
                          alt="Main property"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setEditFormData((prev) => ({
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
                          setEditFormData((prev) => ({
                            ...prev,
                            mainImage: file,
                          }));
                        } else {
                          toast({
                            title: "Error",
                            description: "File size should be less than 2MB",
                            variant: "destructive",
                          });
                        }
                      }}
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
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
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
                          toast({
                            title: "Warning",
                            description:
                              "Some files were skipped as they exceed 2MB size limit",
                          });
                        }
                        setEditFormData((prev) => ({
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
                {(editFormData.additionalImages?.length > 0 ||
                  editingProperty?.additionalImages?.length > 0) && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {editFormData.additionalImages?.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={
                            image instanceof File
                              ? URL.createObjectURL(image)
                              : `${import.meta.env.VITE_SERVER_URL}${image}`
                          }
                          alt={`Additional ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditFormData((prev) => ({
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
                checked={editFormData.isActive}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="isActive">Property Active Status</Label>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingsTable;
