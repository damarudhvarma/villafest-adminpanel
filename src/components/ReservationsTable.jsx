import React from "react";
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

const ReservationsTable = () => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Reservation Management</h2>
        <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto">
          <span className="mr-2">+</span>
          Add Reservation
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Filter reservations..."
          className="w-full sm:max-w-md border-gray-300"
        />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan="5" className="text-center text-gray-500 py-8">
                No results.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default ReservationsTable;
