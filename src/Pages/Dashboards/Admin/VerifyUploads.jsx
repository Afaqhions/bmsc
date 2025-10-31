
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Menu, ChevronDown, Search, X, Check } from "lucide-react";
import axios from "axios";
import Sidebar from "../../../Components/Sidebar";

const VerifyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // ✅ Group uploads by campaign name
  const groupByCampaign = (uploadsData) => {
    const grouped = {};
    uploadsData.forEach((upload) => {
      if (!grouped[upload.campaignName]) {
        grouped[upload.campaignName] = {
          campaignName: upload.campaignName,
          uploads: [],
        };
      }
      grouped[upload.campaignName].uploads.push(upload);
    });
    return grouped;
  };

  const fetchUploads = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        import.meta.env.VITE_API_URL_ADMIN_GET_ALL_UPLOADS || "https://bbms-backend-62q5.onrender.com/api/admin-get-uploads",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data.data || [];
      setUploads(data);
      setFilteredUploads(data);
    } catch (err) {
      console.error("Fetch uploads error", err);
      toast.error("Failed to load uploads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL_SEE_CAMPAIGNS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data || []);
    } catch (err) {
      console.error("Fetch campaigns error", err);
      toast.error("Failed to load campaign durations");
    }
  };

  const verifyUpload = async (uploadId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL_ADMIN_VERIFY_UPLOAD}/${uploadId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Upload verified successfully");
      fetchUploads();
    } catch (err) {
      console.error("Verification error", err);
      toast.error(err?.response?.data?.message || "Verification failed");
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchCampaigns();
  }, []);

  const toggleExpand = (id) =>
    setExpandedId(expandedId === id ? null : id);

  const getCampaignDuration = (upload) => {
    if (upload.campaignDetails) {
      return {
        start: new Date(upload.campaignDetails.startDate).toLocaleDateString(),
        end: new Date(upload.campaignDetails.endDate).toLocaleDateString(),
      };
    }
    const campaign = campaigns.find((c) => c.name === upload.campaignName);
    if (campaign) {
      return {
        start: new Date(campaign.startDate).toLocaleDateString(),
        end: new Date(campaign.endDate).toLocaleDateString(),
      };
    }
    return { start: "-", end: "-" };
  };

  // ✅ Search by campaign name only
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredUploads(uploads);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = uploads.filter((u) =>
      u.campaignName?.toLowerCase().includes(term)
    );
    setFilteredUploads(filtered);
  };

  const resetSearch = () => {
    setSearchTerm("");
    setFilteredUploads(uploads);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 bg-white shadow md:hidden flex items-center justify-between">
          <h1 className="text-lg font-semibold text-indigo-600">
            Verify Campaigns
          </h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={28} />
          </button>
        </div>

        {/* Main */}
        <main className="p-4 md:p-6">
          {/* ✅ Single Search Bar */}
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3 text-indigo-700">
                Search by Campaign Name
              </h2>
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  placeholder="Enter campaign name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow px-4 py-2 border rounded shadow focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center"
                >
                  <Search size={18} className="mr-1" />
                  Search
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center justify-center"
                  >
                    <X size={18} className="mr-1" />
                    Reset
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-500 text-lg">No uploads available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(groupByCampaign(filteredUploads)).map(
                (campaignGroup) => {
                  const firstUpload = campaignGroup.uploads[0];
                  const duration = getCampaignDuration(firstUpload);
                  const campaignId = `campaign-${campaignGroup.campaignName.replace(
                    /\s+/g,
                    "-"
                  )}`;

                  return (
                    <div
                      key={campaignId}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      {/* Campaign Card Header */}
                      <button
                        onClick={() => toggleExpand(campaignId)}
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-indigo-600">
                            {campaignGroup.campaignName}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            <p>
                              <strong>Start Date:</strong> {duration.start}
                            </p>
                            <p>
                              <strong>End Date:</strong> {duration.end}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`transition-transform mt-2 ${
                            expandedId === campaignId ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Expandable Section */}
                      {expandedId === campaignId && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campaignGroup.uploads.map((upload) => (
                              <div
                                key={upload._id}
                                className="border rounded-lg p-3 bg-gray-50"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      upload.dateTime
                                    ).toLocaleString()}
                                  </span>
                                  <span
                                    className={
                                      upload.isVerified
                                        ? "text-green-600 text-sm font-medium"
                                        : "text-red-500 text-sm font-medium"
                                    }
                                  >
                                    {upload.isVerified
                                      ? "Verified ✅"
                                      : "Unverified ❌"}
                                  </span>
                                </div>

                                {upload.imageUrl && (
                                  <div className="mb-2">
                                    <img
                                      src={upload.imageUrl}
                                      alt="upload"
                                      className="w-full h-40 object-cover rounded border"
                                    />
                                  </div>
                                )}

                                {/* ✅ Board Details with Address */}
                                {upload.board && (
                                  <div className="text-sm text-gray-700 mb-2">
                                    <p>
                                      <strong>Board No:</strong>{" "}
                                      {upload.board.BoardNo}
                                    </p>
                                    <p>
                                      <strong>Type:</strong> {upload.board.Type}
                                    </p>
                                    <p>
                                      <strong>Address:</strong>{" "}
                                      {upload.board.Location}
                                    </p>
                                    <p>
                                      <strong>City:</strong> {upload.board.City}
                                    </p>
                                    <p>
                                      <strong>Size:</strong>{" "}
                                      {upload.board.Width}x{upload.board.Height} ft
                                    </p>
                                  </div>
                                )}

                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Serviceman:</strong>{" "}
                                  {upload.serviceManEmail}
                                </p>

                                {!upload.isVerified && (
                                  <button
                                    onClick={() => verifyUpload(upload._id)}
                                    className="w-full py-2 rounded text-white bg-green-600 hover:bg-green-700 flex items-center justify-center mt-2"
                                  >
                                    <Check size={16} className="mr-1" />
                                    Verify
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VerifyUploads;
