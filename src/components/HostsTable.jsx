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
      if (response.data.success) {
        // Transform the data to match our table structure
        const transformedHosts = response.data.data.map((host) => ({
          _id: host.id,
          name: `${host.firstName} ${host.lastName}`,
          email: host.email,
          contact: host.mobileNumber,
          isActive: host.isActive || false,
          properties: host.properties || [],
          createdAt: host.createdAt || new Date().toISOString(),
        }));

        // Separate active and pending hosts
        const activeHosts = transformedHosts.filter((host) => host.isActive);
        const pendingHosts = transformedHosts.filter((host) => !host.isActive);

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
      const response = await axiosinstance.put(`/hosts/${hostId}/reject`);
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
                  Properties
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
                    colSpan="6"
                    className="text-center text-gray-500 py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredHosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="6"
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
                    <TableCell>{host.properties?.length || 0}</TableCell>
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
                  Properties
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
                    colSpan="6"
                    className="text-center text-gray-500 py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPendingHosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan="6"
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
                    <TableCell>{host.properties?.length || 0}</TableCell>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Name</h3>
                  <p>{selectedHost.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Email</h3>
                  <p>{selectedHost.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Contact</h3>
                  <p>{selectedHost.contact}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Status</h3>
                  <p>{selectedHost.isActive ? "Active" : "Pending"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Total Properties
                  </h3>
                  <p>{selectedHost.properties?.length || 0}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">
                    Joined Date
                  </h3>
                  <p>{new Date(selectedHost.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-gray-500">
                  Properties
                </h3>
                <ul className="mt-1 list-disc list-inside">
                  {selectedHost.properties?.map((property) => (
                    <li key={property._id}>{property.title}</li>
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

export default HostsTable;
