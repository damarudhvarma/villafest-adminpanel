import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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

import axiosinstance from "@/axios/axios";

const CategoriesTable = () => {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isActive, setIsActive] = useState(true);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
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
      formData.append("name", categoryName);
      formData.append("image", categoryImage);
      formData.append("isActive", isActive);

      const response = await axiosinstance.post(
        "/categories/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setIsAddCategoryOpen(false);
        setCategoryName("");
        setCategoryImage(null);
        setImagePreview(null);
        setIsActive(true);
        // TODO: Add toast notification for success
      }
    } catch (error) {
      console.error("Error creating category:", error);
      // TODO: Add toast notification for error
    }
  };

  const handleDeleteCategory = (categoryId) => {
    // TODO: Implement category deletion logic
    console.log("Deleting category:", categoryId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryImage">Category Image</Label>
                <Input
                  id="categoryImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-32 h-32 object-cover rounded-md"
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
                  onClick={() => setIsAddCategoryOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <div className="p-4">
          <Input
            type="search"
            placeholder="Search categories..."
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Image</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Properties</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">
                  <img
                    src="https://placehold.co/50x50"
                    alt="Villa"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </td>
                <td className="p-4">Villas</td>
                <td className="p-4">Luxury villas and estates</td>
                <td className="p-4">12</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="p-4">
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
                          This action cannot be undone. This will permanently
                          delete the category and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(1)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
              <tr className="border-b">
                <td className="p-4">
                  <img
                    src="https://placehold.co/50x50"
                    alt="Apartment"
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </td>
                <td className="p-4">Apartments</td>
                <td className="p-4">Modern apartments and condos</td>
                <td className="p-4">8</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                </td>
                <td className="p-4">
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
                          This action cannot be undone. This will permanently
                          delete the category and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(2)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTable;
