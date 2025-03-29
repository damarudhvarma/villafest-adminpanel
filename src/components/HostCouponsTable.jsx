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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { axiosinstance } from "@/axios/axios";

const HostCouponsTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount: "",
    validFrom: "",
    validUntil: "",
    maxUsage: "",
    minPurchase: "",
    maxDiscount: "",
    description: "",
    terms: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await axiosinstance.get("/hosts/coupons");
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsOpen(true);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleActiveToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        discount: Number(formData.discount),
        maxUsage: Number(formData.maxUsage),
        minPurchase: Number(formData.minPurchase),
        maxDiscount: Number(formData.maxDiscount),
        terms: formData.terms
          .split(",")
          .map((term) => term.trim())
          .filter(Boolean),
      };

      const response = await axiosinstance.post("/host/coupons", formattedData);
      if (response.data.success) {
        setIsAddCouponOpen(false);
        setFormData({
          code: "",
          discount: "",
          validFrom: "",
          validUntil: "",
          maxUsage: "",
          minPurchase: "",
          maxDiscount: "",
          description: "",
          terms: "",
          isActive: true,
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
    }
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold">My Coupons</h2>
        <Button
          className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-full sm:w-auto"
          onClick={() => setIsAddCouponOpen(true)}
        >
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan="7"
                  className="text-center text-gray-500 py-8"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan="7"
                  className="text-center text-gray-500 py-8"
                >
                  No coupons found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
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

      {/* Add Coupon Modal */}
      <Dialog open={isAddCouponOpen} onOpenChange={setIsAddCouponOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>
              Fill in the coupon details to create a new promotional code.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="Enter coupon code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter discount percentage"
                  value={formData.discount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="maxUsage">Maximum Usage</Label>
                <Input
                  id="maxUsage"
                  type="number"
                  min="1"
                  placeholder="Enter max usage"
                  value={formData.maxUsage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="minPurchase">Minimum Purchase</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  min="0"
                  placeholder="Enter min purchase"
                  value={formData.minPurchase}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="maxDiscount">Maximum Discount</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min="0"
                  placeholder="Enter max discount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter coupon description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Enter terms & conditions separated by commas"
                value={formData.terms}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveToggle}
              />
              <Label htmlFor="isActive">Active Status</Label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCouponOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white"
              >
                Add Coupon
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                  <p>₹{selectedCoupon.minPurchase}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Max Discount
                  </h3>
                  <p>₹{selectedCoupon.maxDiscount}</p>
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

export default HostCouponsTable;
