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

const CouponsTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axiosinstance.get("/coupons");
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">Coupon Management</h2>
        <Button className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto">
          <span className="mr-2">+</span>
          Add Coupon
        </Button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search coupons..."
          className="w-full sm:max-w-md border-gray-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Code
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Discount
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Valid From
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Valid Until
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Usage
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="7"
                  className="text-center text-gray-500 py-8"
                >
                  No coupons found.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.discount}%</TableCell>
                  <TableCell>
                    {new Date(coupon.validFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        coupon.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {coupon.usageCount}/{coupon.maxUsage}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(coupon)}
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
            <DialogTitle>Coupon Details</DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Code</h3>
                  <p>{selectedCoupon.code}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Discount
                  </h3>
                  <p>{selectedCoupon.discount}%</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Valid From
                  </h3>
                  <p>
                    {new Date(selectedCoupon.validFrom).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Valid Until
                  </h3>
                  <p>
                    {new Date(selectedCoupon.validUntil).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Status</h3>
                  <p>{selectedCoupon.isActive ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Usage</h3>
                  <p>
                    {selectedCoupon.usageCount}/{selectedCoupon.maxUsage}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Min Purchase
                  </h3>
                  <p>${selectedCoupon.minPurchase}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Max Discount
                  </h3>
                  <p>${selectedCoupon.maxDiscount}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Description
                </h3>
                <p className="mt-1">{selectedCoupon.description}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Terms & Conditions
                </h3>
                <ul className="mt-1 list-disc list-inside">
                  {selectedCoupon.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CouponsTable;
