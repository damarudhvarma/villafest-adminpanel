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

import { axiosinstance } from "@/axios/axios";

const BannersTable = () => {
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [editingBanner, setEditingBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axiosinstance.get("/banners");
      if (response.data.success) {
        setBanners(response.data.banners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", bannerTitle);
      formData.append("image", bannerImage);
      formData.append("isActive", isActive);

      const response = await axiosinstance.post("/banners/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setIsAddBannerOpen(false);
        setBannerTitle("");
        setBannerImage(null);
        setImagePreview(null);
        setIsActive(true);
        fetchBanners();
      }
    } catch (error) {
      console.error("Error creating banner:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosinstance.put(
        `/banners/${editingBanner._id}`,
        { isActive },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setIsEditBannerOpen(false);
        setEditingBanner(null);
        fetchBanners();
      }
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setIsActive(banner.isActive);
    setIsEditBannerOpen(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      const response = await axiosinstance.delete(`/banners/${bannerId}`);
      if (response.data.success) {
        setDeleteDialogOpen(false);
        setBannerToDelete(null);
        fetchBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const openDeleteDialog = (banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Banners</h2>
        <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
          <DialogTrigger asChild>
            <Button>Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bannerTitle">Banner Title</Label>
                <Input
                  id="bannerTitle"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Enter banner title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image</Label>
                <Input
                  id="bannerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                )}
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
                  onClick={() => setIsAddBannerOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Banner</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          <Input
            type="search"
            placeholder="Search banners..."
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Title</th>
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
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    No banners found
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner._id} className="border-b">
                    <td className="p-4">
                      <img
                        src={`${import.meta.env.VITE_SERVER_URL}${
                          banner.imagePath
                        }`}
                        alt={banner.title}
                        className="w-24 h-16 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-4">{banner.title}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          banner.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 space-x-2">
                      <Dialog
                        open={isEditBannerOpen}
                        onOpenChange={setIsEditBannerOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBanner(banner)}
                          >
                            Edit Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Banner Status</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleEditSubmit}
                            className="space-y-4"
                          >
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
                                onClick={() => setIsEditBannerOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit">Update Status</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(banner)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              banner and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteBanner(bannerToDelete?._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannersTable;
