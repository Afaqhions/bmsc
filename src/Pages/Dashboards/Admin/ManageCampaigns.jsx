import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CampaignGalleryModal from "../../../Components/CampaignGalleryModal";

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [serviceMen, setServiceMen] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignImages, setCampaignImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    noOfBoards: "",
    selectedBoards: [],
    clientEmail: "",
    serviceManEmail: [], 
    price: "",
  });

  const token = localStorage.getItem("token");

  // Fetch Campaigns, Boards and Clients
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data with token:", token);
      try {
        const [campaignRes, boardsRes, usersRes] = await Promise.all([
          axios.get(import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(import.meta.env.VITE_API_URL_GET_BOARDS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(import.meta.env.VITE_API_URL_GET_ALL_USERS, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const campaignsData = Array.isArray(campaignRes.data)
          ? campaignRes.data
          : campaignRes.data.campaigns || [];

        const boardsData = Array.isArray(boardsRes.data)
          ? boardsRes.data
          : boardsRes.data.boards || [];

        const usersData = Array.isArray(usersRes.data)
          ? usersRes.data
          : usersRes.data.users || [];

        setCampaigns(campaignsData);

        const clientUsers = usersData.filter((user) => user.role === "client");
        setClients(clientUsers);

        const usedBoardIds = campaignsData.flatMap((camp) =>
          (camp.selectedBoards || []).map((b) =>
            typeof b === "object" ? b._id : b
          )
        );

        const selectedBoardIds = editId
          ? campaignsData
              .find((c) => c._id === editId)
              ?.selectedBoards.map((b) =>
                typeof b === "object" ? b._id : b
              ) || []
          : [];

        const freeBoards = boardsData.filter(
          (board) =>
            !usedBoardIds.includes(board._id) || selectedBoardIds.includes(board._id)
        );

        const cityList = [...new Set(freeBoards.map((b) => b.City))].filter(
          Boolean
        );
        setCities(cityList);

        if (selectedCity) {
          setFilteredBoards(
            freeBoards.filter(
              (b) => b.City.toLowerCase() === selectedCity.toLowerCase()
            )
          );
        }
      } catch (error) {
        console.error("Error details:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Error loading campaigns. Please check your connection and try again."
        );
      }
    };

    fetchData();
  }, [token, editId, selectedCity]);

  // Fetch service men when selectedCity changes
  useEffect(() => {
    const fetchServiceMen = async () => {
      if (!selectedCity) {
        setServiceMen([]);
        return;
      }

      try {
        const url = `${import.meta.env.VITE_API_URL_GET_SERVICEMAN_BY_CITY}/${encodeURIComponent(
          selectedCity
        )}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.serviceMen)
          ? res.data.serviceMen
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const serviceMenList = rawData.map((item) => {
          if (typeof item === "string") {
            return { email: item, name: item };
          }
          return {
            _id: item._id,
            email: item.email || item.serviceManEmail || "",
            name: item.name || item.fullName || "No Name",
          };
        });

        setServiceMen(serviceMenList);
      } catch (err) {
        setServiceMen([]);
        toast.error("Failed to fetch service men for the selected city.");
        console.error("Service men fetch error:", err);
      }
    };

    fetchServiceMen();
  }, [selectedCity, token]);

  const handleCityChange = async (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setFormData((prev) => ({
      ...prev,
      selectedBoards: [],
      serviceManEmail: [],
    }));

    if (city) {
      try {
        const boardsUrl = `${import.meta.env.VITE_API_URL_GET_BOARDS_BY_CITY}/${encodeURIComponent(
          city
        )}`;
        const res = await axios.get(boardsUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const boardsData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.boards)
          ? res.data.boards
          : [];

        setFilteredBoards(boardsData);
      } catch (error) {
        toast.error("Failed to fetch boards for selected city.");
        setFilteredBoards([]);
        console.error("Board fetch error:", error);
      }
    } else {
      setFilteredBoards([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, selectedOptions } = e.target;
    if (name === "selectedBoards" || name === "serviceManEmail") {
      const selected = Array.from(selectedOptions).map((opt) => opt.value);
      setFormData((prev) => ({ ...prev, [name]: selected }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      name,
      startDate,
      endDate,
      noOfBoards,
      selectedBoards,
      clientEmail,
      serviceManEmail,
      price,
    } = formData;

    if (
      !name.trim() ||
      !startDate ||
      !endDate ||
      !noOfBoards ||
      !clientEmail ||
      !serviceManEmail ||
      !price ||
      selectedBoards.length === 0
    ) {
      toast.error("All required fields must be filled and boards selected.");
      return;
    }

    const url = editId
      ? `${import.meta.env.VITE_API_URL_UPDATE_CAMPAIGN}/${editId}`
      : import.meta.env.VITE_API_URL_CREATE_CAMPAIGN;

    const method = editId ? "put" : "post";

    const clientObj = clients.find((c) => c.email === clientEmail);
    const clientName = clientObj ? clientObj.name : "";

    const payload = {
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      noOfBoards: parseInt(noOfBoards),
      selectedBoards,
      clientEmail: clientEmail.trim(),
      clientName,
      serviceManEmail,
      city: selectedCity,
      price: parseFloat(price),
    };

    try {
      await axios[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(`Campaign ${editId ? "updated" : "created"} successfully`);

      setEditId(null);
      setShowForm(false);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        noOfBoards: "",
        selectedBoards: [],
        clientEmail: "",
        serviceManEmail: [],
        price: "",
      });
      setSelectedCity("");
      setFilteredBoards([]);

      const updated = await axios.get(
        import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCampaigns(updated.data);
    } catch (err) {
      console.error("Submit error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Server error while creating/updating campaign";
      toast.error(msg);
    }
  };

  const handleEdit = (campaign) => {
    let cityFromCampaign = "";
    if (campaign.selectedBoards && campaign.selectedBoards.length > 0) {
      const firstBoard = campaign.selectedBoards[0];
      cityFromCampaign =
        typeof firstBoard === "object" ? firstBoard.City || "" : "";
    }

    setEditId(campaign._id);

    if (cityFromCampaign) {
      setSelectedCity(cityFromCampaign);
    } else {
      setSelectedCity("");
    }

    setFormData({
      name: campaign.name,
      startDate: campaign.startDate.slice(0, 10),
      endDate: campaign.endDate.slice(0, 10),
      noOfBoards: campaign.noOfBoards,
      selectedBoards: (campaign.selectedBoards || []).map((b) =>
        typeof b === "object" ? b._id : b
      ),
      clientEmail: campaign.clientEmail,
      serviceManEmail: campaign.serviceManEmail || [],
      price: campaign.price,
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL_DELETE_CAMPAIGN}/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Campaign deleted");
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete campaign");
      console.error(err);
    }
  };

  const handleImageUpload = async (campaignId, campaign) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg, image/jpg, image/png';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          toast.error('Please select a JPEG or PNG image');
          return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          toast.error('Image size should be less than 5MB');
          return;
        }

        toast.info('Uploading image...', { 
          autoClose: false,
          toastId: 'uploadProgress'
        });
        
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('campaignId', campaignId);
        
        let locationData = {
          location: campaign.city || 'Unknown',
          city: campaign.city || 'Unknown',
          latitude: 0,
          longitude: 0
        };

        // Try to get location if available
        if (navigator.geolocation) {
          try {
              const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 5000,
                  maximumAge: 0,
                  enableHighAccuracy: false
                });
              });
            
              locationData = {
                ...locationData,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
            } catch (_) {
              // Silently fall back to default location
            }
        }

        // Append location data to form
        Object.entries(locationData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/admin/upload-image`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                toast.update('uploadProgress', { 
                  render: `Uploading: ${progress}%`
                });
              }
            }
          );

          toast.dismiss('uploadProgress');
          
          if (response.data?.data) {
            toast.success('Image uploaded successfully');
            // Refresh the images list
            handleViewImages(campaignId);
          } else {
            throw new Error('Invalid server response');
          }
        } catch (error) {
          toast.dismiss('uploadProgress');
          const errorMessage = error.response?.data?.message || 
                             error.response?.data?.error || 
                             'Failed to upload image';
          toast.error(errorMessage);
          console.error('Upload failed:', errorMessage);
        } finally {
          setUploadingImage(false);
        }
      };

      input.click();
    } catch (error) {
      toast.error('Failed to initiate image upload');
      console.error('Image upload initialization error:', error);
      setUploadingImage(false);
    }
  };

  const handleViewImages = async (campaignId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/campaign-images/${campaignId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const campaign = campaigns.find(c => c._id === campaignId);
      setSelectedCampaign(campaign);
      setCampaignImages(response.data.data);
      setShowGallery(true);
    } catch (err) {
      console.error('Fetch images error:', err);
      toast.error('Failed to fetch campaign images');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="p-6 w-full">
        <ToastContainer />
        <button
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded shadow-md"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditId(null);
              setFormData({
                name: "",
                startDate: "",
                endDate: "",
                noOfBoards: "",
                selectedBoards: [],
                clientEmail: "",
                serviceManEmail: [],
                price: "",
              });
              setSelectedCity("");
              setFilteredBoards([]);
            }
          }}
        >
          {showForm ? "Close Form" : "Add Campaign"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label>
              Campaign Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>
            <label>
              Number of Boards
              <input
                type="number"
                name="noOfBoards"
                value={formData.noOfBoards}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>

            <label>
              Client Email
              <select
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              >
                <option value="">-- Select Client --</option>
                {clients.length === 0 && (
                  <option value="" disabled>
                    No clients found
                  </option>
                )}
                {clients.map(({ _id, name, email, city }) => (
                  <option key={_id} value={email}>
                    {`${name} - ${email} - ${city || "-"}`}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="border p-2 w-full"
              />
            </label>

            <label className="col-span-2">
              Select City
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="border p-2 w-full"
                required
              >
                <option value="">-- Select City --</option>
                {cities.map((city, idx) => (
                  <option key={idx} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2">
              Assign Service Man
              <select
                name="serviceManEmail"
                multiple
                value={formData.serviceManEmail}
                onChange={handleChange}
                className="border p-2 w-full"
                required
              >
                <option value="">-- Select Service Man --</option>
                {serviceMen.length === 0 && (
                  <option value="" disabled>
                    {selectedCity
                      ? "No service men found"
                      : "Select a city first"}
                  </option>
                )}
                {serviceMen.map(({ _id, email, name }) => (
                  <option key={_id || email} value={email}>
                    {name} - {email}
                  </option>
                ))}
              </select>
            </label>

            <label className="col-span-2">
              Select Boards
              <select
                name="selectedBoards"
                multiple
                value={formData.selectedBoards}
                onChange={handleChange}
                className="border p-2 w-full h-32"
                required
              >
                {filteredBoards.map((board) => (
                  <option key={board._id} value={board._id}>
                    {board.BoardNo} - {board.City}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
            >
              {editId ? "Update Campaign" : "Create Campaign"}
            </button>
          </form>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="border p-4 rounded shadow bg-white transform transition-all duration-300 hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-indigo-600">
                {campaign.name}
              </h2>
              <p>📧 Client Email: {campaign.clientEmail}</p>
              <p>
                👷 Tracker:{" "}
                {Array.isArray(campaign.serviceManEmail)
                  ? campaign.serviceManEmail.join(", ")
                  : campaign.serviceManEmail || "—"}
              </p>
              <p>
                💰 Price: PKR{" "}
                {campaign.price?.toLocaleString?.() ?? campaign.price}
              </p>
              <p>📋 Boards: {campaign.noOfBoards}</p>
              <p>
                📅 Duration: {campaign.startDate.slice(0, 10)} →{" "}
                {campaign.endDate.slice(0, 10)}
              </p>
              <p className="italic text-sm text-gray-500">
                Boards:{" "}
                {campaign.selectedBoards
                  .map((b) =>
                    typeof b === "object" ? `${b.BoardNo} - ${b.City}` : b
                  )
                  .join(", ")}
              </p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEdit(campaign)}
                  className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleImageUpload(campaign._id, campaign)}
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </button>
                <button
                  onClick={() => handleViewImages(campaign._id)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  View Images
                </button>
              </div>
            </div>
          ))}
        </div>

        <CampaignGalleryModal
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          images={campaignImages}
          campaignName={selectedCampaign?.name || ""}
          campaign={selectedCampaign}
        />
      </div>
    </div>
  );
};

export default ManageCampaigns;
