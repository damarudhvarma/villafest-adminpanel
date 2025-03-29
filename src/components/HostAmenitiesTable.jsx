import React, { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { axiosinstance } from "@/axios/axios";

const HostAmenitiesTable = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await axiosinstance.get("/amenities");
      if (response.data.success) {
        setAmenities(response.data.amenities);
      }
    } catch (error) {
      console.error("Error fetching amenities:", error);
      setError("Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  };

  const filteredAmenities = amenities.filter((amenity) =>
    amenity.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-bold">Available Amenities</h2>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search amenities..."
          className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Icon</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredAmenities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center">
                    No amenities found
                  </td>
                </tr>
              ) : (
                filteredAmenities.map((amenity) => (
                  <tr key={amenity._id} className="border-b">
                    <td className="p-4">
                      {amenity.iconUrl ? (
                        <img
                          src={`${import.meta.env.VITE_SERVER_URL}/${
                            amenity.icon
                          }`}
                          alt={amenity.name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </td>
                    <td className="p-4">{amenity.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          amenity.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {amenity.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostAmenitiesTable;
