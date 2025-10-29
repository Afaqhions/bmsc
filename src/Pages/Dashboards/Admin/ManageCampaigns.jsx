// import React, { useEffect, useState } from "react";
// import Sidebar from "../../../components/Sidebar";
// import axios from "axios";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { motion } from "framer-motion";

// const ManageCampaigns = () => {
//   const [campaigns, setCampaigns] = useState([]);
//   const [allBoards, setAllBoards] = useState([]);
//   const [filteredBoards, setFilteredBoards] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [selectedCity, setSelectedCity] = useState("");
//   const [serviceMen, setServiceMen] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     startDate: "",
//     endDate: "",
//     noOfBoards: "",
//     selectedBoards: [],
//     clientEmail: "",
//     serviceManEmail: [], // Making sure this is explicitly initialized as an array
//     price: "",
//   });

//   const token = localStorage.getItem("token");

//   // Fetch Campaigns, Boards and Clients
//   useEffect(() => {
//     const fetchData = async () => {
//       console.log('Fetching data with token:', token);
//       try {
//         const [campaignRes, boardsRes, usersRes] = await Promise.all([
//           axios.get(import.meta.env.VITE_API_URL_GET_ALL_CAMPAIGNS, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(import.meta.env.VITE_API_URL_GET_BOARDS, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(import.meta.env.VITE_API_URL_SEE_USERS, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         const campaignsData = Array.isArray(campaignRes.data)
//           ? campaignRes.data
//           : campaignRes.data.campaigns || [];

//         const boardsData = Array.isArray(boardsRes.data)
//           ? boardsRes.data
//           : boardsRes.data.boards || [];

//         const usersData = Array.isArray(usersRes.data)
//           ? usersRes.data
//           : usersRes.data.users || [];

//         setCampaigns(campaignsData);

//         const clientUsers = usersData.filter((user) => user.role === "client");
//         setClients(clientUsers);

//         const usedBoardIds = campaignsData.flatMap((camp) =>
//           (camp.selectedBoards || []).map((b) =>
//             typeof b === "object" ? b._id : b
//           )
//         );

//         const selectedBoardIds = editId
//           ? campaignsData
//               .find((c) => c._id === editId)
//               ?.selectedBoards.map((b) =>
//                 typeof b === "object" ? b._id : b
//               ) || []
//           : [];

//         const freeBoards = boardsData.filter(
//           (board) =>
//             !usedBoardIds.includes(board._id) ||
//             selectedBoardIds.includes(board._id)
//         );

//         setAllBoards(freeBoards);

//         const cityList = [...new Set(freeBoards.map((b) => b.City))].filter(
//           Boolean
//         );
//         setCities(cityList);

//         if (selectedCity) {
//           setFilteredBoards(
//             freeBoards.filter(
//               (b) => b.City.toLowerCase() === selectedCity.toLowerCase()
//             )
//           );
//         }
//       } catch (error) {
//         console.error('Error details:', error);
//         toast.error(
//           error.response?.data?.message || 
//           error.message || 
//           "Error loading campaigns. Please check your connection and try again."
//         );
//         console.error("Fetch error:", error);
//       }
//     };

//     fetchData();
//   }, [token, editId]);

//   // Fetch service men when selectedCity changes
//   useEffect(() => {
//     const fetchServiceMen = async () => {
//       if (!selectedCity) {
//         setServiceMen([]);
//         return;
//       }

//       try {
//         const url = `${import.meta.env.VITE_API_URL_GET_SERVICEMAN_BY_CITY}/${encodeURIComponent(
//           selectedCity
//         )}`;
//         const res = await axios.get(url, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const rawData = Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data?.serviceMen)
//           ? res.data.serviceMen
//           : Array.isArray(res.data?.data)
//           ? res.data.data
//           : [];

//         const serviceMenList = rawData.map((item) => {
//           if (typeof item === "string") {
//             return { email: item, name: item };
//           }
//           return {
//             _id: item._id,
//             email: item.email || item.serviceManEmail || "",
//             name: item.name || item.fullName || "No Name",
//           };
//         });

//         setServiceMen(serviceMenList);
//       } catch (err) {
//         setServiceMen([]);
//         toast.error("Failed to fetch service men for the selected city.");
//         console.error("Service men fetch error:", err);
//       }
//     };

//     fetchServiceMen();
//   }, [selectedCity, token]);

//   const handleCityChange = async (e) => {
//     const city = e.target.value;
//     setSelectedCity(city);
//     setFormData((prev) => ({
//       ...prev,
//       selectedBoards: [],
//       serviceManEmail: [], // Changed from empty string to empty array
//     }));

//     if (city) {
//       try {
//         const boardsUrl = `${import.meta.env.VITE_API_URL_GET_BOARDS_BY_CITY}/${encodeURIComponent(
//           city
//         )}`;
//         const res = await axios.get(boardsUrl, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const boardsData = Array.isArray(res.data)
//           ? res.data
//           : Array.isArray(res.data?.boards)
//           ? res.data.boards
//           : [];

//         setFilteredBoards(boardsData);
//       } catch (error) {
//         toast.error("Failed to fetch boards for selected city.");
//         setFilteredBoards([]);
//         console.error("Board fetch error:", error);
//       }
//     } else {
//       setFilteredBoards([]);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, selectedOptions } = e.target;
//     if (name === "selectedBoards" || name === "serviceManEmail") {
//       const selected = Array.from(selectedOptions).map((opt) => opt.value);
//       setFormData((prev) => ({ ...prev, [name]: selected }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };



//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const {
//       name,
//       startDate,
//       endDate,
//       noOfBoards,
//       selectedBoards,
//       clientEmail,
//       serviceManEmail,
//       price,
//     } = formData;

//     if (
//       !name.trim() ||
//       !startDate ||
//       !endDate ||
//       !noOfBoards ||
//       !clientEmail ||
//       !serviceManEmail ||
//       !price ||
//       selectedBoards.length === 0
//     ) {
//       toast.error("All required fields must be filled and boards selected.");
//       return;
//     }

//     const url = editId
//       ? `${import.meta.env.VITE_API_URL_UPDATE_CAMPAIGNS}/${editId}`
//       : import.meta.env.VITE_API_URL_CREATE_CAMPAIGN;

//     const method = editId ? "put" : "post";

//     const clientObj = clients.find((c) => c.email === clientEmail);
//     const clientName = clientObj ? clientObj.name : "";

//     const payload = {
//       name: name.trim(),
//       startDate: new Date(startDate),
//       endDate: new Date(endDate),
//       noOfBoards: parseInt(noOfBoards),
//       selectedBoards,
//       clientEmail: clientEmail.trim(),
//       clientName,
//       serviceManEmail,
//       city: selectedCity,
//       price: parseFloat(price),
//     };

//     console.log("Sending payload:", payload);
//     console.log("Selected boards:", selectedBoards);
//     console.log("URL:", url);
//     console.log("Method:", method);

//     try {
//       await axios[method](url, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       toast.success(`Campaign ${editId ? "updated" : "created"} successfully`);

//       setEditId(null);
//       setShowForm(false);
//       setFormData({
//         name: "",
//         startDate: "",
//         endDate: "",
//         noOfBoards: "",
//         selectedBoards: [],
//         clientEmail: "",
//         serviceManEmail: "",
//         price: "",
//       });
//       setSelectedCity("");
//       setFilteredBoards([]);

//       const updated = await axios.get(
//         import.meta.env.VITE_API_URL_SEE_CAMPAIGNS,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setCampaigns(updated.data);
//     } catch (err) {
//       console.error("Submit error:", err);
//       console.error("Error response:", err?.response?.data);
      
//       const msg =
//         err?.response?.data?.message ||
//         err?.response?.data?.error ||
//         err?.message ||
//         "Server error while creating/updating campaign";
      
//       toast.error(msg);
      
//       // Log additional details for debugging
//       if (err?.response?.data?.details) {
//         console.error("Error details:", err.response.data.details);
//       }
//     }
//   };

//   const handleEdit = (campaign) => {
//     let cityFromCampaign = "";
//     if (campaign.selectedBoards && campaign.selectedBoards.length > 0) {
//       const firstBoard = campaign.selectedBoards[0];
//       cityFromCampaign =
//         typeof firstBoard === "object" ? firstBoard.City || "" : "";
//     }

//     setEditId(campaign._id);

//     if (cityFromCampaign) {
//       setSelectedCity(cityFromCampaign);
//     } else {
//       setSelectedCity("");
//     }

//     setFormData({
//       name: campaign.name,
//       startDate: campaign.startDate.slice(0, 10),
//       endDate: campaign.endDate.slice(0, 10),
//       noOfBoards: campaign.noOfBoards,
//       selectedBoards: (campaign.selectedBoards || []).map((b) =>
//         typeof b === "object" ? b._id : b
//       ),
//       clientEmail: campaign.clientEmail,
//       serviceManEmail: campaign.serviceManEmail || [],
//       price: campaign.price,
//     });

//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this campaign?"))
//       return;
//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_API_URL_DELET_CAMPAIGNS}/${id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success("Campaign deleted");
//       setCampaigns((prev) => prev.filter((c) => c._id !== id));
//     } catch (err) {
//       toast.error("Failed to delete campaign");
//       console.error(err);
//     }
//   };

//   return (
//     <div className="flex flex-col md:flex-row min-h-screen">
//       <Sidebar />
//       <div className="p-6 w-full">
//         <ToastContainer />
//         <button
//           className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded shadow-md"
//           onClick={() => {
//             setShowForm(!showForm);
//             if (!showForm) {
//               setEditId(null);
//               setFormData({
//                 name: "",
//                 startDate: "",
//                 endDate: "",
//                 noOfBoards: "",
//                 selectedBoards: [],
//                 clientEmail: "",
//                 serviceManEmail: "",
//                 price: "",
//               });
//               setSelectedCity("");
//               setFilteredBoards([]);
//             }
//           }}
//         >
//           {showForm ? "Close Form" : "Add Campaign"}
//         </button>

//         {showForm && (
//           <form
//             onSubmit={handleSubmit}
//             className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             <label>
//               Campaign Name
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               />
//             </label>
//             <label>
//               Start Date
//               <input
//                 type="date"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               />
//             </label>
//             <label>
//               End Date
//               <input
//                 type="date"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               />
//             </label>
//             <label>
//               Number of Boards
//               <input
//                 type="number"
//                 name="noOfBoards"
//                 value={formData.noOfBoards}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               />
//             </label>

//             <label>
//               Client Email
//               <select
//                 name="clientEmail"
//                 value={formData.clientEmail}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               >
//                 <option value="">-- Select Client --</option>
//                 {clients.length === 0 && (
//                   <option value="" disabled>
//                     No clients found
//                   </option>
//                 )}
//                 {clients.map(({ _id, name, email, city }) => (
//                   <option key={_id} value={email}>
//                     {`${name} - ${email} - ${city || "-"}`}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label>
//               Price
//               <input
//                 type="number"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 required
//                 className="border p-2 w-full"
//               />
//             </label>

//             <label className="col-span-2">
//               Select City
//               <select
//                 value={selectedCity}
//                 onChange={handleCityChange}
//                 className="border p-2 w-full"
//                 required
//               >
//                 <option value="">-- Select City --</option>
//                 {cities.map((city, idx) => (
//                   <option key={idx} value={city}>
//                     {city}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label className="col-span-2">
//               Assign Service Man
//               <select
//                 name="serviceManEmail"
//                 multiple
//                 value={formData.serviceManEmail}
//                 onChange={handleChange}
//                 className="border p-2 w-full"
//                 required
//               >
//                 <option value="">-- Select Service Man --</option>
//                 {serviceMen.length === 0 && (
//                   <option value="" disabled>
//                     {selectedCity
//                       ? "No service men found"
//                       : "Select a city first"}
//                   </option>
//                 )}
//                 {serviceMen.map(({ _id, email, name }) => (
//                   <option key={_id || email} value={email}>
//                     {name} - {email}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <label className="col-span-2">
//               Select Boards
//               <select
//                 name="selectedBoards"
//                 multiple
//                 value={formData.selectedBoards}
//                 onChange={handleChange}
//                 className="border p-2 w-full h-32"
//                 required
//               >
//                 {filteredBoards.map((board) => (
//                   <option key={board._id} value={board._id}>
//                     {board.BoardNo} - {board.City}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             <button
//               type="submit"
//               className="bg-green-600 text-white px-4 py-2 rounded col-span-2"
//             >
//               {editId ? "Update Campaign" : "Create Campaign"}
//             </button>
//           </form>
//         )}

//         <div className="mt-8 grid grid-cols-1 gap-4">
//           {campaigns.map((campaign) => (
//             <motion.div
//               key={campaign._id}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="border p-4 rounded shadow bg-white"
//             >
//               <h2 className="text-xl font-semibold text-indigo-600">
//                 {campaign.name}
//               </h2>
//               <p>📧 Client Email: {campaign.clientEmail}</p>
//               <p>
//                 👷 Tracker: {Array.isArray(campaign.serviceManEmail) ? campaign.serviceManEmail.join(", ") : campaign.serviceManEmail || "—"}
//               </p>
//               <p>
//                 💰 Price: PKR{" "}
//                 {campaign.price?.toLocaleString?.() ?? campaign.price}
//               </p>
//               <p>📋 Boards: {campaign.noOfBoards}</p>
//               <p>
//                 📅 Duration: {campaign.startDate.slice(0, 10)} →{" "}
//                 {campaign.endDate.slice(0, 10)}
//               </p>
//               <p className="italic text-sm text-gray-500">
//                 Boards:{" "}
//                 {campaign.selectedBoards
//                   .map((b) =>
//                     typeof b === "object" ? `${b.BoardNo} - ${b.City}` : b
//                   )
//                   .join(", ")}
//               </p>
//               <div className="mt-2 space-x-2">
//                 <button
//                   onClick={() => handleEdit(campaign)}
//                   className="bg-yellow-400 text-black px-4 py-1 rounded"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(campaign._id)}
//                   className="bg-red-600 text-white px-4 py-1 rounded"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageCampaigns;


import React, { useEffect, useState } from "react";
import Sidebar from "../../../Components/Sidebar";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const ManageCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [allBoards, setAllBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [serviceMen, setServiceMen] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

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
            !usedBoardIds.includes(board._id) ||
            selectedBoardIds.includes(board._id)
        );

        setAllBoards(freeBoards);

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
            <motion.div
              key={campaign._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border p-4 rounded shadow bg-white"
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
                  className="bg-yellow-400 text-black px-4 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="bg-red-600 text-white px-4 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageCampaigns;
