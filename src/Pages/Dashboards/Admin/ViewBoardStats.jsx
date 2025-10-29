import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import axios from "axios";
import { Menu } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ViewBoardStats = () => {
  const [boards, setBoards] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const [boardsRes, campaignsRes] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL_SEE_BOARD, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(import.meta.env.VITE_API_URL_SEE_CAMPAIGNS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const boardList = Array.isArray(boardsRes.data)
        ? boardsRes.data
        : boardsRes.data.boards || [];

      const campaignList = Array.isArray(campaignsRes.data)
        ? campaignsRes.data
        : campaignsRes.data.campaigns || [];

      setBoards(boardList);
      setCampaigns(campaignList);

      const now = new Date();
      const formatted = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      setLastUpdated(formatted);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate board statistics based on actual board data
  const getBoardStats = () => {
    const totalBoards = boards.length;
    
    // Get all board IDs that are currently in use in any campaign
    const usedBoardIds = new Set(
      campaigns.flatMap(campaign => campaign.selectedBoards || []).map(board => board._id)
    );
    
    const heldBoards = usedBoardIds.size;
    const freeBoards = totalBoards - heldBoards;

    return {
      total: totalBoards,
      held: heldBoards,
      free: freeBoards,
      cities: new Set(boards.map(board => board.City)).size
    };
  };

  const boardStats = getBoardStats();

  // Prepare data for charts showing actual board numbers
  const cityBoardsData = () => {
    const cityBoardDetails = {};
    boards.forEach(board => {
      const boardNo = board.BoardNo;
      if (!cityBoardDetails[board.City]) {
        cityBoardDetails[board.City] = {
          count: 0,
          boardNumbers: []
        };
      }
      cityBoardDetails[board.City].count += 1;
      cityBoardDetails[board.City].boardNumbers.push(boardNo);
    });

    const sortedCities = Object.entries(cityBoardDetails)
      .sort(([,a], [,b]) => b.count - a.count);

    return {
      labels: sortedCities.map(([city]) => city),
      datasets: [
        {
          label: 'Number of Boards',
          data: sortedCities.map(([, details]) => details.count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Create data for the board status pie chart
  const boardStatusData = {
    labels: ['Held Boards', 'Free Boards'],
    datasets: [
      {
        data: [boardStats.held, boardStats.free],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Boards Distribution by City',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };



  const boardPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Board Status Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col w-full overflow-y-auto">
        {/* Mobile topbar */}
        <div className="p-4 bg-white shadow-md md:hidden flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Board Statistics</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 hidden md:block">Board Statistics</h1>
          
          {/* Last updated info */}
          <div className="text-sm text-gray-500 mb-6">
            Last updated: {lastUpdated}
          </div>

          {/* Board Statistics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-indigo-100">
              <p className="text-sm text-gray-500 mb-1">Total Boards</p>
              <p className="text-3xl font-bold text-indigo-600">{boardStats.total}</p>
              <p className="text-xs text-gray-400 mt-2">Total advertising boards</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
              <p className="text-sm text-gray-500 mb-1">Available Boards</p>
              <p className="text-3xl font-bold text-green-600">{boardStats.free}</p>
              <p className="text-xs text-gray-400 mt-2">{((boardStats.free / boardStats.total) * 100).toFixed(1)}% available</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-red-100">
              <p className="text-sm text-gray-500 mb-1">Currently In Use</p>
              <p className="text-3xl font-bold text-red-600">{boardStats.held}</p>
              <p className="text-xs text-gray-400 mt-2">{((boardStats.held / boardStats.total) * 100).toFixed(1)}% occupied</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
              <p className="text-sm text-gray-500 mb-1">Cities Covered</p>
              <p className="text-3xl font-bold text-blue-600">{boardStats.cities}</p>
              <p className="text-xs text-gray-400 mt-2">Locations with boards</p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-purple-100">
              <p className="text-sm text-gray-500 mb-1">Average Boards per City</p>
              <p className="text-3xl font-bold text-purple-600">
                {(boardStats.total / boardStats.cities).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 mt-2">Average distribution</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-100">
              <p className="text-sm text-gray-500 mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold text-yellow-600">{campaigns.length}</p>
              <p className="text-xs text-gray-400 mt-2">Current running campaigns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-teal-100">
              <p className="text-sm text-gray-500 mb-1">Boards per Campaign</p>
              <p className="text-3xl font-bold text-teal-600">
                {campaigns.length > 0 ? (boardStats.held / campaigns.length).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-gray-400 mt-2">Average usage per campaign</p>
            </div>
          </div>

          {/* City Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top Cities by Board Count</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from(new Set(boards.map(board => board.City)))
                .sort((a, b) => {
                  const countA = boards.filter(board => board.City === a).length;
                  const countB = boards.filter(board => board.City === b).length;
                  return countB - countA;
                })
                .slice(0, 8)
                .map(city => {
                  const cityBoards = boards.filter(board => board.City === city);
                  const usedBoards = campaigns.reduce((sum, campaign) => {
                    return sum + (campaign.selectedBoards?.filter(board => 
                      cityBoards.some(cb => cb._id === board._id)
                    ).length || 0);
                  }, 0);
                  
                  return (
                    <div key={city} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">{city}</p>
                      <p className="text-lg font-bold text-indigo-600">{cityBoards.length}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span className="text-green-600">{cityBoards.length - usedBoards} free</span>
                        <span className="mx-1">·</span>
                        <span className="text-red-600">{usedBoards} used</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Board Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="h-[400px]">
                <Bar options={barOptions} data={cityBoardsData()} />
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="h-[400px]">
                <Pie options={boardPieOptions} data={boardStatusData} />
              </div>
            </div>
          </div>

          {/* Detailed City Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Detailed City Statistics</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">City</th>
                    <th className="px-4 py-2 text-left">Total Boards</th>
                    <th className="px-4 py-2 text-left">Free Boards</th>
                    <th className="px-4 py-2 text-left">Board Numbers</th>
                    <th className="px-4 py-2 text-left">Usage %</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(boards.map(board => board.City)))
                    .sort((a, b) => {
                      const countA = boards.filter(board => board.City === a).length;
                      const countB = boards.filter(board => board.City === b).length;
                      return countB - countA;
                    })
                    .map(city => {
                      const cityBoards = boards.filter(board => board.City === city);
                      const totalCityBoards = cityBoards.length;
                      const usedBoardIds = campaigns.flatMap(campaign => 
                        campaign.selectedBoards?.map(board => board._id) || []
                      );
                      
                      const freeBoards = cityBoards.filter(board => 
                        !usedBoardIds.includes(board._id)
                      );
                      
                      const usagePercentage = ((1 - (freeBoards.length / totalCityBoards)) * 100).toFixed(1);

                      return (
                        <tr key={city} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">{city}</td>
                          <td className="px-4 py-3">{totalCityBoards}</td>
                          <td className="px-4 py-3">{freeBoards.length}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {cityBoards
                                .sort((a, b) => a.BoardNo.localeCompare(b.BoardNo, undefined, { numeric: true }))
                                .map(board => (
                                  <span 
                                    key={board._id}
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                      freeBoards.some(fb => fb._id === board._id)
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                    title={freeBoards.some(fb => fb._id === board._id) ? 'Free' : 'In Use'}
                                  >
                                    {board.BoardNo}
                                  </span>
                                ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${usagePercentage}%` }}
                                ></div>
                              </div>
                              <span className="whitespace-nowrap">{usagePercentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBoardStats;
