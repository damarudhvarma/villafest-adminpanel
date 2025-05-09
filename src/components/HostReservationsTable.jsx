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
  DialogDescription,
} from "@/components/ui/dialog";
import { hostAxiosInstance } from "@/axios/axios";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

const HostReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [hostProperties, setHostProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (isBlockModalOpen) {
      fetchHostProperties();
    }
  }, [isBlockModalOpen]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, filterStatus]);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("HostToken");
      const response = await hostAxiosInstance.get("/bookings/host-property", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setReservations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reservations. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHostProperties = async () => {
    try {
      const token = localStorage.getItem("HostToken");
      const response = await hostAxiosInstance.get(
        "/host-properties/get-host-property",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setHostProperties(response.data.data);
        // Set default property if available
        if (response.data.data.length > 0) {
          setSelectedProperty(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching host properties:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
      });
    }
  };

  const handleBlockReservations = async () => {
    if (!selectedProperty || selectedDates.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a property and dates to block",
      });
      return;
    }

    try {
      setBlockingLoading(true);
      const token = localStorage.getItem("HostToken");
      const response = await hostAxiosInstance.post(
        `/host-properties/${selectedProperty}/block-dates`,
        {
          blockedDates: selectedDates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Dates blocked successfully",
        });
        setIsBlockModalOpen(false);
        fetchReservations();
        // Reset selections
        setSelectedDates([]);
        setSelectedProperty("");
      }
    } catch (error) {
      console.error("Error blocking dates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to block dates",
      });
    } finally {
      setBlockingLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.propertyDetails.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reservation.userDetails.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reservation.userDetails.email
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus === "active") {
      const currentDate = new Date();
      filtered = filtered.filter((reservation) => {
        const checkOutDate = new Date(reservation.bookingDate.checkOut);
        return reservation.status === "confirmed" && checkOutDate > currentDate;
      });
    } else if (filterStatus === "cancelled") {
      filtered = filtered.filter(
        (reservation) => reservation.status === "cancelled"
      );
    }

    setFilteredReservations(filtered);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Confirmed
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Paid
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Search by property or guest..."
            className="w-full sm:max-w-md border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reservations</SelectItem>
              <SelectItem value="active">Active Reservations</SelectItem>
              <SelectItem value="cancelled">Cancelled Reservations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setIsBlockModalOpen(true)}
        >
          Block Reservations
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Property
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Guest
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Check In
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Check Out
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Payment
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Your Share
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
                  colSpan="8"
                  className="text-center text-gray-500 py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="8"
                  className="text-center text-gray-500 py-8"
                >
                  No reservations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow
                  key={reservation.id}
                  className={
                    selectedReservation?.id === reservation.id
                      ? "bg-gray-50"
                      : ""
                  }
                  onClick={() => handleViewDetails(reservation)}
                >
                  <TableCell className="font-medium">
                    {reservation.propertyDetails.title}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{reservation.userDetails.name}</div>
                      <div className="text-xs text-gray-500">
                        {reservation.userDetails.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(reservation.bookingDate.checkIn)}
                  </TableCell>
                  <TableCell>
                    {formatDate(reservation.bookingDate.checkOut)}
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(reservation.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    ₹{reservation.yourShare.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(reservation);
                      }}
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

      {/* Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="grid gap-4 py-4">
              {/* Property Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-gray-500">Title</h4>
                    <p>{selectedReservation.propertyDetails.title}</p>
                  </div>
                  {selectedReservation.propertyDetails.images?.length > 0 && (
                    <div className="col-span-2">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">
                        Images
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReservation.propertyDetails.images.map(
                          (image, index) => (
                            <img
                              key={index}
                              src={`${import.meta.env.VITE_SERVER_URL}${image}`}
                              alt={`Property ${index + 1}`}
                              className="rounded-lg w-full h-32 object-cover"
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Details */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Guest Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Name</h4>
                    <p>{selectedReservation.userDetails.name}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Email</h4>
                    <p>{selectedReservation.userDetails.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                    <p>{selectedReservation.userDetails.mobileNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Number of Guests
                    </h4>
                    <p>{selectedReservation.numberOfGuests}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Booking Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Check In
                    </h4>
                    <p>{formatDate(selectedReservation.bookingDate.checkIn)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Check Out
                    </h4>
                    <p>
                      {formatDate(selectedReservation.bookingDate.checkOut)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Status
                    </h4>
                    <p>{selectedReservation.status}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Payment Status
                    </h4>
                    <p>{selectedReservation.paymentStatus}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Your Share
                    </h4>
                    <p>₹{selectedReservation.yourShare.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Booking Date
                    </h4>
                    <p>{formatDate(selectedReservation.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Reservations Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Block Reservation Dates</DialogTitle>
            <DialogDescription>
              Select a property and dates to block for reservations
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Property Selection */}
            <div className="grid gap-2">
              <Label htmlFor="property">Select Property</Label>
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {hostProperties.map((property) => (
                    <SelectItem key={property._id} value={property._id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection Calendar */}
            <div className="grid gap-2">
              <Label>Select Dates to Block</Label>
              <div className="border rounded-md p-4">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  className="rounded-md border"
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </div>
              {selectedDates.length > 0 && (
                <div className="text-sm text-gray-500">
                  {selectedDates.length} date(s) selected
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBlockModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleBlockReservations}
                disabled={
                  !selectedProperty ||
                  selectedDates.length === 0 ||
                  blockingLoading
                }
              >
                {blockingLoading ? "Blocking..." : "Block Dates"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HostReservationsTable;
