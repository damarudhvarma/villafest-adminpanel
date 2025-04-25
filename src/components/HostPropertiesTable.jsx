import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { axiosinstance } from "@/axios/axios";
import { useToast } from "@/components/ui/use-toast";

const HostPropertiesTable = () => {
  const { toast } = useToast();
  const [hostProperties, setHostProperties] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchHostProperties();
  }, []);

  const fetchHostProperties = async () => {
    try {
      const response = await axiosinstance.get("/host-properties/all");
     
      setHostProperties(response.data);
    } catch (error) {
      console.error("Error fetching host properties:", error);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      await axiosinstance.patch(`/host-properties/${propertyId}/approve`);
      toast({
        title: "Success",
        description: "Property approved successfully",
        variant: "default",
      });
      fetchHostProperties(); // Refresh the list
    } catch (error) {
      console.error("Error approving property:", error);
      toast({
        title: "Error",
        description: "Failed to approve property",
        variant: "destructive",
      });
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      await axiosinstance.patch(`/host-properties/${propertyId}/reject`);
      toast({
        title: "Success",
        description: "Property rejected successfully",
        variant: "default",
      });
      fetchHostProperties(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting property:", error);
      toast({
        title: "Error",
        description: "Failed to reject property",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = hostProperties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.category?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Host Properties</h2>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search properties..."
          className="w-full sm:max-w-md border-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
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
                Weekend Price
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.length === 0 ? (
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
                  <TableCell>{property.category?.name}</TableCell>
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
                        View
                      </Button>
                      {property.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveProperty(property._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectProperty(property._id)}
                          >
                            Reject
                          </Button>
                        </>
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
                  <h3 className="font-medium text-gray-500">Maximum Guests</h3>
                  <p>{selectedProperty.maxGuests} guests</p>
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
    </>
  );
};

export default HostPropertiesTable;
