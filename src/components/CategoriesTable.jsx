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

const CategoriesTable = () => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Category Management</h2>
        <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto">
          <span className="mr-2">+</span>
          Add Category
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Filter categories..."
          className="w-full sm:max-w-md border-gray-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Name
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Description
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Properties
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan="4" className="text-center text-gray-500 py-8">
                No results.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default CategoriesTable;
