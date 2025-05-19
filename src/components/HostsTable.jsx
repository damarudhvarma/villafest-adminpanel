import React, { useState, useEffect } from "react";
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
import { axiosinstance } from "@/axios/axios";

const HostsTable = () => {
  const [hosts, setHosts] = useState([]);
  const [pendingHosts, setPendingHosts] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosinstance.get("/hosts");
      console.log(response.data);
      if (response.data.success) {
        // Transform the data to match our table structure
        const transformHost = (host) => ({
          _id: host._id,
          name: host.fullName,
          email: host.email,
          contact: host.phoneNumber,
          isActive: host.isActive,
          bankingDetails: host.bankingDetails,
          createdAt: host.createdAt,
          enquiry: host.enquiry,
        });

        // Transform active and pending hosts
        const activeHosts = response.data.data.activeHosts.map(transformHost);
        const pendingHosts = response.data.data.pendingHosts.map(transformHost);

        setHosts(activeHosts);
        setPendingHosts(pendingHosts);
      }
    } catch (error) {
      console.error("Error fetching hosts:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (host) => {
    setSelectedHost(host);
    setIsDetailsOpen(true);
  };

  const handleApproveHost = async (hostId) => {
    try {
      const response = await axiosinstance.put(`/hosts/${hostId}/approve`);
      if (response.data.success) {
        // Refresh the lists after successful approval
        fetchHosts();
        // You might want to show a success toast here
      }
    } catch (error) {
      console.error("Error approving host:", error);
      // You might want to show an error toast here
    }
  };

  const handleRejectHost = async (hostId) => {
    try {
      const response = await axiosinstance.delete(`/hosts/${hostId}/reject`);
      if (response.data.success) {
        // Refresh the lists after successful rejection
        fetchHosts();
        // You might want to show a success toast here
      }
    } catch (error) {
      console.error("Error rejecting host:", error);
      // You might want to show an error toast here
    }
  };

  // Filter hosts based on search query
  const filteredHosts = hosts.filter(
    (host) =>
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.contact.includes(searchQuery)
  );

  const filteredPendingHosts = pendingHosts.filter(
    (host) =>
      host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.contact.includes(searchQuery)
  );

  return (
    <>
      {/* Active Hosts Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Active Hosts</h2>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search active hosts..."
            className="w-full sm:max-w-md border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Active Hosts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Contact
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    className="text-center text-gray-500 py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredHosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    className="text-center text-gray-500 py-8"
                  >
                    No active hosts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredHosts.map((host) => (
                  <TableRow key={host._id}>
                    <TableCell className="font-medium">{host.name}</TableCell>
                    <TableCell>{host.email}</TableCell>
                    <TableCell>{host.contact}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(host)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold">Pending Approvals</h2>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search pending hosts..."
            className="w-full sm:max-w-md border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Pending Approvals Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Email
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                  Contact
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    className="text-center text-gray-500 py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPendingHosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="5"
                    className="text-center text-gray-500 py-8"
                  >
                    No pending approvals found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPendingHosts.map((host) => (
                  <TableRow key={host._id}>
                    <TableCell className="font-medium">{host.name}</TableCell>
                    <TableCell>{host.email}</TableCell>
                    <TableCell>{host.contact}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(host)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveHost(host._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectHost(host._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Host Details</DialogTitle>
          </DialogHeader>
          {selectedHost && (
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Name</h4>
                    <p>{selectedHost.name}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Email</h4>
                    <p>{selectedHost.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Contact
                    </h4>
                    <p>{selectedHost.contact}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Status
                    </h4>
                    <p>{selectedHost.isActive ? "Active" : "Pending"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Joined Date
                    </h4>
                    <p>
                      {new Date(selectedHost.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Banking Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Account Holder Name
                    </h4>
                    <p>{selectedHost.bankingDetails?.accountHolderName}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Bank Name
                    </h4>
                    <p>{selectedHost.bankingDetails?.bankName}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Account Number
                    </h4>
                    <p>{selectedHost.bankingDetails?.accountNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      IFSC Code
                    </h4>
                    <p>{selectedHost.bankingDetails?.ifscCode}</p>
                  </div>
                </div>
              </div>

              {/* Government ID Images */}
              {selectedHost.bankingDetails?.govId?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-gray-500 mb-2">
                    Government ID
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedHost.bankingDetails.govId.map((idImage, index) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}${idImage}`}
                          alt={`Government ID ${index + 1}`}
                          className="rounded-lg object-contain w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enquiry Details */}
              {selectedHost.enquiry && (
                <>
                  {/* Location Details */}
                  {selectedHost.enquiry.locationDetails && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Location Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <h4 className="text-xs font-medium text-gray-500">
                            Address
                          </h4>
                          <p>{selectedHost.enquiry.locationDetails.address}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            City
                          </h4>
                          <p>{selectedHost.enquiry.locationDetails.city}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            State
                          </h4>
                          <p>{selectedHost.enquiry.locationDetails.state}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Postal Code
                          </h4>
                          <p>
                            {selectedHost.enquiry.locationDetails.postalCode}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Country
                          </h4>
                          <p>{selectedHost.enquiry.locationDetails.country}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Details */}
                  {selectedHost.enquiry.propertyDetails && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Property Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <h4 className="text-xs font-medium text-gray-500">
                            Title
                          </h4>
                          <p>{selectedHost.enquiry.propertyDetails.title}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Regular Price
                          </h4>
                          <p>
                            ₹{selectedHost.enquiry.propertyDetails.regularPrice}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Weekend Price
                          </h4>
                          <p>
                            ₹{selectedHost.enquiry.propertyDetails.weekendPrice}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium text-gray-500">
                            Guest Limit
                          </h4>
                          <p>
                            {selectedHost.enquiry.propertyDetails.guestLimit}{" "}
                            guests
                          </p>
                        </div>
                        {selectedHost.enquiry.propertyDetails.description && (
                          <div className="col-span-2">
                            <h4 className="text-xs font-medium text-gray-500">
                              Description
                            </h4>
                            <p>
                              {selectedHost.enquiry.propertyDetails.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Property Images */}
                  {selectedHost.enquiry.propertyDetails?.photos?.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Property Images
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedHost.enquiry.propertyDetails.photos.map(
                          (photo, index) => (
                            <div key={index} className="relative aspect-video">
                              <img
                                src={`${
                                  import.meta.env.VITE_SERVER_URL
                                }/${photo}`}
                                alt={`Property image ${index + 1}`}
                                className="rounded-lg object-cover w-full h-full"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {(selectedHost.enquiry?.amenities?.length > 0 ||
                    selectedHost.enquiry?.customAmenities?.length > 0) && (
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {/* Standard Amenities */}
                        {selectedHost.enquiry?.amenities?.map(
                          (amenity, index) => (
                            <span
                              key={`standard-${index}`}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                            >
                              {amenity.icon && (
                                <img
                                  src={`${import.meta.env.VITE_SERVER_URL}${
                                    amenity.icon
                                  }`}
                                  alt={amenity.name}
                                  className="w-4 h-4"
                                />
                              )}
                              {amenity.name}
                            </span>
                          )
                        )}
                        {/* Custom Amenities */}
                        {selectedHost.enquiry?.customAmenities?.map(
                          (amenity, index) => (
                            <span
                              key={`custom-${index}`}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                            >
                              {amenity}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Property Rules */}
                  {selectedHost.enquiry.propertyRules?.length > 0 && (
                    <div className="bg-rose-50 p-4 rounded-lg">
                      <h3 className="font-medium text-sm text-gray-500 mb-2">
                        Property Rules
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedHost.enquiry.propertyRules.map(
                          (rule, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                            >
                              {rule}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HostsTable;
