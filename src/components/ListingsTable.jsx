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
import axiosinstance from "@/axios/axios";

const ListingsTable = ({ onAddProperty }) => {
  const [properties, setProperties] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axiosinstance.get("/properties/get-properties");
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Property Management</h2>
        <Button
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto"
          onClick={onAddProperty}
        >
          <span className="mr-2">+</span>
          Add Property
        </Button>
      </div>

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
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                More Details
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="5"
                  className="text-center text-gray-500 py-8"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property._id}>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.category?.name}</TableCell>
                  <TableCell>${property.price}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        property.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {property.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(property)}
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
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="grid gap-4 py-4">
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
                  <p>${selectedProperty.price}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Weekend Price
                  </h3>
                  <p>${selectedProperty.weekendPrice}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Status</h3>
                  <p>{selectedProperty.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Owner Name
                  </h3>
                  <p>{selectedProperty.owner.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Owner Contact
                  </h3>
                  <p>{selectedProperty.owner.contact}</p>
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
                <h3 className="font-medium text-sm text-gray-500">Amenities</h3>
                <ul className="mt-1 list-disc list-inside">
                  {selectedProperty.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">Location</h3>
                <p className="mt-1">
                  Latitude: {selectedProperty.location.coordinates[1]},
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

export default ListingsTable;
