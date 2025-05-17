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
import { axiosinstance } from "@/axios/axios";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DateRangePicker from "./DateRangePicker";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";

const ReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [allProperties, setAllProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, filterStatus]);

  useEffect(() => {
    if (isBlockModalOpen) {
      fetchAllProperties();
    }
  }, [isBlockModalOpen]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axiosinstance.get("/bookings/all");
      if (response.data.success) {
        setReservations(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.propertyDetails.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.userDetails.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.userDetails.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
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
    switch (status) {
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
      case "not eligible for refund":
        return <Badge variant="secondary">Not Eligible</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  };

  const fetchAllProperties = async () => {
    try {
      const response = await axiosinstance.get("/properties/get-properties");
      if (response.data.success) {
        setAllProperties(response.data.properties);
        // Set default property if available and none selected
        if (response.data.properties.length > 0 && !selectedProperty) {
          setSelectedProperty(response.data.properties[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  // When selectedProperty changes, update booked/blocked dates
  useEffect(() => {
    if (!selectedProperty || !allProperties.length) {
      setBookedDates([]);
      setBlockedDates([]);
      return;
    }
    const property = allProperties.find((p) => p._id === selectedProperty);
    // Booked Dates
    let booked = [];
    if (property && property.bookedDates && property.bookedDates.length) {
      property.bookedDates.forEach((booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        booked.push(...getDatesInRange(checkIn, checkOut));
      });
    }
    setBookedDates(booked);
    // Blocked Dates
    let blocked = [];
    if (property && property.blockedDates && property.blockedDates.length) {
      property.blockedDates.forEach((block) => {
        if (block.startDate && block.endDate) {
          const start = new Date(block.startDate);
          const end = new Date(block.endDate);
          blocked.push(...getDatesInRange(start, end));
        }
      });
    }
    setBlockedDates(blocked);
  }, [selectedProperty, allProperties]);

  // Helper: get all dates in range
  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const last = new Date(endDate);
    current.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);
    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Handle block dates
  const handleBlockReservations = async () => {
    if (!selectedProperty || selectedDates.length === 0) return;
    try {
      setBlockingLoading(true);
      const sorted = [...selectedDates].sort((a, b) => a - b);
      const startDate = sorted[0];
      const endDate = sorted[sorted.length - 1];
      const formattedStart = startDate.toISOString();
      const formattedEnd = endDate.toISOString();
      const response = await axiosinstance.post(
        `/properties/${selectedProperty}/block-dates`,
        { startDate: formattedStart, endDate: formattedEnd }
      );
      if (response.data.success) {
        setIsBlockModalOpen(false);
        setSelectedDates([]);
        setSelectedProperty("");
        setTimeout(() => fetchAllProperties(), 100);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to block dates. Please try again."
      );
    } finally {
      setBlockingLoading(false);
    }
  };

  // Handle delete blocked date range
  const handleDeleteBlockedDate = async (blockId) => {
    if (!selectedProperty) return;
    try {
      setIsDeleteLoading(true);
      const response = await axiosinstance.delete(
        `/properties/${selectedProperty}/blocked-date/${blockId}`
      );
      if (response.data.success) {
        setTimeout(() => fetchAllProperties(), 100);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove blocked date.");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Date selection handler
  const handleDatesSelected = (dates) => setSelectedDates(dates);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Reservation Management</h2>
        <Button
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setIsBlockModalOpen(true)}
        >
          Block Reservations
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by property or guest..."
          className="w-full sm:max-w-md border-gray-300"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Select value={filterStatus} onValueChange={handleFilterChange}>
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
                Total Price
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                More
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
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
                <TableRow key={reservation.id}>
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
                    ₹{reservation.totalPrice.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(reservation)}
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Property Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">Title</h4>
                    <p>{selectedReservation.propertyDetails.title}</p>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
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
              <div className="bg-gray-50 p-4 rounded-lg">
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
                    <p>{getStatusBadge(selectedReservation.status)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Total Price
                    </h4>
                    <p>₹{selectedReservation.totalPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-gray-500 mb-2">
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Payment Status
                    </h4>
                    <p>
                      {getPaymentStatusBadge(selectedReservation.paymentStatus)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Payment ID
                    </h4>
                    <p>{selectedReservation.paymentDetails.paymentId}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500">
                      Order ID
                    </h4>
                    <p>{selectedReservation.paymentDetails.orderId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Reservations Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Block Reservation Dates</DialogTitle>
            <DialogDescription>
              Select a property and dates to block for reservations
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            {/* Property Selection */}
            <div className="grid gap-2">
              <Label htmlFor="property" className="text-sm font-medium">
                Select Property
              </Label>
              <Select
                value={selectedProperty}
                onValueChange={(value) => {
                  setSelectedProperty(value);
                  setSelectedDates([]);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {allProperties.map((property) => (
                    <SelectItem key={property._id} value={property._id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProperty && (
                <div className="text-xs text-gray-500 mt-1">
                  {allProperties.find((p) => p._id === selectedProperty)?.title}
                  {" - "}
                  {
                    allProperties.find((p) => p._id === selectedProperty)
                      ?.address?.city
                  }
                  {", "}
                  {
                    allProperties.find((p) => p._id === selectedProperty)
                      ?.address?.state
                  }
                </div>
              )}
            </div>
            {/* Date Selection Calendar */}
            <div className="grid gap-2">
              <Label className="text-sm font-medium">
                Select Dates to Block
              </Label>
              {selectedProperty ? (
                <>
                  <DateRangePicker
                    onDatesSelected={handleDatesSelected}
                    excludedDates={bookedDates}
                    blockedDates={blockedDates}
                  />
                  {bookedDates.length > 0 && (
                    <div className="text-xs text-amber-600 mt-1">
                      Note: Red dates are already booked and cannot be selected
                    </div>
                  )}
                  {blockedDates.length > 0 && (
                    <div className="text-xs text-gray-700 mt-1">
                      Note: Black dates are already blocked and cannot be
                      selected
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Please select a property first
                </p>
              )}
              {selectedDates.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {selectedDates.length} date(s) selected for blocking
                </div>
              )}
            </div>
            {/* Currently Blocked Dates Table */}
            {selectedProperty &&
              allProperties.find((p) => p._id === selectedProperty)
                ?.blockedDates?.length > 0 && (
                <div className="grid gap-2 mt-2">
                  <Label className="text-sm font-medium">
                    Currently Blocked Dates
                  </Label>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs py-2">
                            Property
                          </TableHead>
                          <TableHead className="text-xs py-2">From</TableHead>
                          <TableHead className="text-xs py-2">To</TableHead>
                          <TableHead className="text-xs py-2 w-[50px]">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allProperties
                          .find((p) => p._id === selectedProperty)
                          .blockedDates.map((block, idx) => {
                            const startDate = new Date(block.startDate);
                            const endDate = new Date(block.endDate);
                            return (
                              <TableRow key={block._id || idx}>
                                <TableCell className="py-2 text-xs">
                                  {
                                    allProperties.find(
                                      (p) => p._id === selectedProperty
                                    )?.title
                                  }
                                </TableCell>
                                <TableCell className="py-2 text-xs">
                                  {formatDate(startDate)}
                                </TableCell>
                                <TableCell className="py-2 text-xs">
                                  {formatDate(endDate)}
                                </TableCell>
                                <TableCell className="py-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() =>
                                      handleDeleteBlockedDate(block._id)
                                    }
                                    disabled={isDeleteLoading}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBlockModalOpen(false)}
                className="h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white h-9 px-4"
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

export default ReservationsTable;
