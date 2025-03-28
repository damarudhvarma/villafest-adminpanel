import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, Upload } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import axiosinstance from "@/axios/axios";

const AmenitiesTable = () => {
  const [isAddAmenityOpen, setIsAddAmenityOpen] = useState(false);
  const [isEditAmenityOpen, setIsEditAmenityOpen] = useState(false);
  const [amenityName, setAmenityName] = useState("");
  const [amenityIcon, setAmenityIcon] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await axiosinstance.get("/amenities");
      if (response.data.success) {
        setAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      setError("Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedIcon(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", amenityName);
      formData.append("isActive", isActive);
      if (selectedIcon) {
        formData.append("icon", selectedIcon);
      }

      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await axiosinstance.post("/amenities/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setIsAddAmenityOpen(false);
        setAmenityName("");
        setAmenityIcon("");
        setIsActive(true);
        setSelectedIcon(null);
        setIconPreview(null);
        fetchAmenities();
      }
    } catch (error) {
      console.error("Error creating amenity:", error);
      // Add error handling UI feedback here
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", amenityName);
      formData.append("isActive", isActive);
      if (selectedIcon) {
        formData.append("icon", selectedIcon);
      }

      const response = await axiosinstance.put(
        `/amenities/${editingAmenity._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setIsEditAmenityOpen(false);
        setAmenityName("");
        setAmenityIcon("");
        setIsActive(true);
        setSelectedIcon(null);
        setIconPreview(null);
        setEditingAmenity(null);
        fetchAmenities();
      }
    } catch (error) {
      console.error("Error updating amenity:", error);
    }
  };

  const handleEditAmenity = (amenity) => {
    setEditingAmenity(amenity);
    setAmenityName(amenity.name);
    setAmenityIcon(amenity.icon);
    setIsActive(amenity.isActive);
    setIconPreview(amenity.iconUrl);
    setIsEditAmenityOpen(true);
  };

  const handleDeleteAmenity = async (amenityId) => {
    try {
      const response = await axiosinstance.delete(`/amenities/${amenityId}`);
      if (response.data.success) {
        fetchAmenities();
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Amenities</h2>
        <Dialog open={isAddAmenityOpen} onOpenChange={setIsAddAmenityOpen}>
          <DialogTrigger asChild>
            <Button>Add Amenity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Amenity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amenityName">Amenity Name</Label>
                <Input
                  id="amenityName"
                  value={amenityName}
                  onChange={(e) => setAmenityName(e.target.value)}
                  placeholder="Enter amenity name"
                />
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {iconPreview ? (
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                      id="icon-upload"
                    />
                    <Label
                      htmlFor="icon-upload"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Icon</span>
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Recommended size: 64x64px, Max size: 2MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="status">Active Status</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddAmenityOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Amenity</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          <Input
            type="search"
            placeholder="Search amenities..."
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Icon</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    No amenities found
                  </td>
                </tr>
              ) : (
                amenities.map((amenity) => (
                  <tr key={amenity._id} className="border-b">
                    <td className="p-4">
                      {amenity.iconUrl ? (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/${amenity.icon}`}
                          alt={amenity.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </td>
                    <td className="p-4">{amenity.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          amenity.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {amenity.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <Dialog
                        open={isEditAmenityOpen}
                        onOpenChange={setIsEditAmenityOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAmenity(amenity)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Amenity</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleEditSubmit}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="editAmenityName">
                                Amenity Name
                              </Label>
                              <Input
                                id="editAmenityName"
                                value={amenityName}
                                onChange={(e) => setAmenityName(e.target.value)}
                                placeholder="Enter amenity name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <div className="flex items-center space-x-4">
                                <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                  {iconPreview ? (
                                    <img
                                      src={iconPreview}
                                      alt="Icon preview"
                                      className="w-full h-full object-contain p-2"
                                    />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleIconChange}
                                    className="hidden"
                                    id="edit-icon-upload"
                                  />
                                  <Label
                                    htmlFor="edit-icon-upload"
                                    className="flex items-center space-x-2 cursor-pointer"
                                  >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload New Icon</span>
                                  </Label>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Recommended size: 64x64px, Max size: 2MB
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="editStatus"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                              />
                              <Label htmlFor="editStatus">Active Status</Label>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditAmenityOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Update Amenity</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the amenity and remove it from
                              our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAmenity(amenity._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesTable;
