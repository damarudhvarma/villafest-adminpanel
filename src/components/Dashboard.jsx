import React, { useState } from "react";
import { Card } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { title: "Total Listings", value: 0 },
    { title: "Pending Listings", value: 0 },
    { title: "Total Reservations", value: 0 },
    { title: "Pending Reservations", value: 0 },
    { title: "Categories", value: 0 },
  ];

  const tabs = ["Listings", "Reservations", "Categories", "Content"];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 lg:mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 lg:p-6 shadow-sm">
            <h3 className="text-sm lg:text-[15px] text-gray-600 font-medium mb-1 lg:mb-2">
              {stat.title}
            </h3>
            <p className="text-xl lg:text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 lg:mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              className={`py-3 sm:py-4 px-1 ${
                index === 0
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Property Management Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Property Management</h2>
          <Button
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="mr-2">+</span>
            Add Property
          </Button>
        </div>

        {/* Add Property Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-[500px] w-[90%] p-3 sm:p-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-1">
              <DialogTitle className="text-base font-bold">
                Add New Property
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Title</label>
                  <Input type="text" className="h-8" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category</label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Price</label>
                  <Input type="number" defaultValue={0} className="h-8" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Room Count</label>
                  <Input type="number" defaultValue={1} className="h-8" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Bathroom Count</label>
                  <Input type="number" defaultValue={1} className="h-8" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Guest Count</label>
                  <Input type="number" defaultValue={1} className="h-8" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Description</label>
                <Textarea className="min-h-[60px] resize-none text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Address</label>
                <Input className="h-8" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Location</label>
                <Input className="h-8" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Image URLs (one per line)
                </label>
                <Textarea
                  placeholder="Enter image URLs, one per line"
                  className="min-h-[60px] resize-none text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Amenities</label>
                <Input className="h-8" />
              </div>

              <Button
                className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-8 mt-1 text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Add Property
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                  Category
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Price
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan="4"
                  className="text-center text-gray-500 py-8"
                >
                  No results.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center sm:justify-end mt-4 space-x-2">
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
