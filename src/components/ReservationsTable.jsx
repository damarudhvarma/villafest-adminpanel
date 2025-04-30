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
} from "@/components/ui/dialog";

const ReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, filterStatus]);

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

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Reservation Management</h2>
        {/* Add Reservation button commented out
        <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto">
          <span className="mr-2">+</span>
          Add Reservation
        </Button>
        */}
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
    </>
  );
};

export default ReservationsTable;
