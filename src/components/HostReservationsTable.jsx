import React, { useState, useEffect, useCallback } from "react";
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
import DateRangePicker from "./DateRangePicker";
import { Trash } from "lucide-react";

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
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { toast } = useToast();

  // Helper function to get all dates between start and end
  // Memoize this function to prevent recreation on each render
  const getDatesInRange = useCallback((startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    // Set time to beginning of day to compare only dates
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    // Add each date in the range
    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, []);

  // Define all callback functions before useEffect hooks that use them
  const fetchReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await hostAxiosInstance.get("/bookings/host-property");

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
  }, [toast]);

  const fetchHostProperties = useCallback(async () => {
    try {
      const response = await hostAxiosInstance.get("/properties/active");

      if (response.data.success) {
        setHostProperties(response.data.properties);
        // Set default property if available and no property is currently selected
        if (response.data.properties.length > 0 && !selectedProperty) {
          setSelectedProperty(response.data.properties[0]._id);
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
  }, [toast, selectedProperty]);

  const fetchBookedDates = useCallback(async () => {
    if (!selectedProperty || !hostProperties.length) return;

    try {
      // Find the selected property in our already loaded properties
      const property = hostProperties.find((p) => p._id === selectedProperty);

      if (property && property.bookedDates && property.bookedDates.length) {
        // Process booked dates from the property data
        const bookedDatesList = [];

        // Extract dates from bookedDates array
        property.bookedDates.forEach((booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);

          // Get all dates between check-in and check-out
          const dates = getDatesInRange(checkIn, checkOut);
          bookedDatesList.push(...dates);
        });

        setBookedDates(bookedDatesList);
      } else {
        setBookedDates([]);
      }

      // Process blocked dates if they exist
      if (property && property.blockedDates && property.blockedDates.length) {
        const blockedDatesList = [];

        // Extract dates from blockedDates array
        property.blockedDates.forEach((blockData) => {
          if (blockData.startDate && blockData.endDate) {
            const startDate = new Date(blockData.startDate);
            const endDate = new Date(blockData.endDate);

            // Get all dates between start and end dates
            const dates = getDatesInRange(startDate, endDate);
            blockedDatesList.push(...dates);
          }
        });

        setBlockedDates(blockedDatesList);
      } else {
        setBlockedDates([]);
      }
    } catch (error) {
      console.error("Error processing dates:", error);
      setBookedDates([]);
      setBlockedDates([]);
    }
  }, [selectedProperty, hostProperties, getDatesInRange]);

  // Filter reservations - memoize this function or the result
  const filterReservations = useCallback(() => {
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
  }, [reservations, searchQuery, filterStatus]);

  const handleBlockReservations = useCallback(async () => {
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

      // Get the earliest and latest dates from the selection
      const sortedDates = [...selectedDates].sort(
        (a, b) => a.getTime() - b.getTime()
      );
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];

      // Format dates to ISO string format for the server
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      const response = await hostAxiosInstance.post(
        `/properties/${selectedProperty}/block-dates`,
        {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Dates blocked successfully",
        });

        // Close modal first to prevent extra renders while data is loading
        setIsBlockModalOpen(false);

        // Reset selections before fetching new data
        setSelectedDates([]);
        setSelectedProperty("");

        // After state is reset, fetch updated data
        setTimeout(() => {
          fetchReservations();
          fetchHostProperties();
        }, 100);
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
  }, [
    selectedProperty,
    selectedDates,
    toast,
    fetchReservations,
    fetchHostProperties,
  ]);

  const handleDeleteBlockedDate = useCallback(
    async (date) => {
      if (!selectedProperty) return;

      try {
        setIsDeleteLoading(true);

        // Find the block entry that contains this date
        const property = hostProperties.find((p) => p._id === selectedProperty);

        if (!property || !property.blockedDates) {
          throw new Error("Property or blocked dates not found");
        }

        // Find which block contains this date
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        let blockIdToDelete = null;

        // Find the block ID that contains this date
        for (const block of property.blockedDates) {
          const startDate = new Date(block.startDate);
          const endDate = new Date(block.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          const datesInRange = getDatesInRange(startDate, endDate);

          // Check if our target date is in this range
          if (datesInRange.some((d) => d.getTime() === targetDate.getTime())) {
            blockIdToDelete = block._id;
            break;
          }
        }

        if (!blockIdToDelete) {
          throw new Error("Could not find the block containing this date");
        }

        const response = await hostAxiosInstance.delete(
          `/properties/${selectedProperty}/blocked-date/${blockIdToDelete}`
        );

        if (response.data.success) {
          toast({
            title: "Success",
            description: "Blocked date removed successfully",
          });

          // Refetch property data to update blocked dates
          fetchHostProperties();
        }
      } catch (error) {
        console.error("Error deleting blocked date:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.response?.data?.message ||
            error.message ||
            "Failed to remove blocked date",
        });
      } finally {
        setIsDeleteLoading(false);
      }
    },
    [
      selectedProperty,
      hostProperties,
      toast,
      fetchHostProperties,
      getDatesInRange,
    ]
  );

  // Memoize this function to prevent recreation on each render
  const handleViewDetails = useCallback((reservation) => {
    setSelectedReservation(reservation);
    setIsDetailsOpen(true);
  }, []);

  // Format date in DD/MM/YY format
  const formatDate = (dateString) => {
    try {
      // If dateString is undefined or null, return "Invalid Date"
      if (!dateString) {
        return "Invalid Date";
      }

      // Create a new date object from the input string
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateString);
        return "Invalid Date";
      }

      // Format the date as DD/MM/YY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid Date";
    }
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

  const handleDatesSelected = useCallback((dates) => {
    setSelectedDates(dates);
  }, []);

  // Now define useEffect hooks after all the functions they depend on
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (isBlockModalOpen) {
      fetchHostProperties();
    }
  }, [isBlockModalOpen, fetchHostProperties]);

  useEffect(() => {
    if (selectedProperty) {
      fetchBookedDates();
    }
  }, [selectedProperty, fetchBookedDates]);

  useEffect(() => {
    filterReservations();
  }, [filterReservations]);

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
                  {hostProperties.map((property) => (
                    <SelectItem key={property._id} value={property._id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProperty && (
                <div className="text-xs text-gray-500 mt-1">
                  {
                    hostProperties.find((p) => p._id === selectedProperty)
                      ?.title
                  }{" "}
                  -
                  {
                    hostProperties.find((p) => p._id === selectedProperty)
                      ?.address.city
                  }
                  ,
                  {
                    hostProperties.find((p) => p._id === selectedProperty)
                      ?.address.state
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
              hostProperties.find((p) => p._id === selectedProperty)
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
                        {(() => {
                          const property = hostProperties.find(
                            (p) => p._id === selectedProperty
                          );

                          if (!property || !property.blockedDates) {
                            return null;
                          }

                          return property.blockedDates.map((block, index) => {
                            const startDate = new Date(block.startDate);
                            const endDate = new Date(block.endDate);

                            return (
                              <TableRow key={block._id || index}>
                                <TableCell className="py-2 text-xs">
                                  {property.title}
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
                                      handleDeleteBlockedDate(startDate)
                                    }
                                    disabled={isDeleteLoading}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })()}
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

export default HostReservationsTable;
