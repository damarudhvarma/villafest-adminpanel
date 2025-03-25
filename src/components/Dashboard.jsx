import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ListingsTable from "./ListingsTable";
import ReservationsTable from "./ReservationsTable";
import CategoriesTable from "./CategoriesTable";

const Dashboard = () => {
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Listings");

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
      default:
        return (
          <ListingsTable onAddProperty={() => setIsAddPropertyOpen(true)} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Welcome back, Admin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Properties */}
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

        {/* Active Reservations */}
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

        {/* Total Revenue */}
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

        {/* Occupancy Rate */}
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

      {/* Tabs */}
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
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* Add Property Modal */}
      <Dialog open={isAddPropertyOpen} onOpenChange={setIsAddPropertyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter property title"
                className="h-8"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Select category"
                className="h-8"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter price"
                className="h-8"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter property description"
                className="h-20"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddPropertyOpen(false)}
                className="h-8"
              >
                Cancel
              </Button>
              <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white h-8">
                Add Property
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
