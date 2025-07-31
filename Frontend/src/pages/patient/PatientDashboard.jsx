import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const PatientDashboard = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatientInfo = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setPatient(res.data);
    } catch (err) {
      console.error("Failed to fetch patient info:", err);
    }
  };

  const fetchMedications = async () => {
    try {
      const res = await api.get("/api/medication/my");
      setMedications(Array.isArray(res.data.medications) ? res.data.medications : []);
    } catch (err) {
      console.error("Error fetching medications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdherenceLogs = async () => {
    try {
      const res = await api.get("/api/adherence/my");
      setLogs(res.data.logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/medication/${id}`);
      fetchMedications();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAdherence = async (id, status) => {
    try {
      await api.post("/api/adherence/log", { medicationId: id, status });
      alert(`Marked as ${status}`);
      fetchAdherenceLogs();
    } catch (err) {
      console.error("Adherence error:", err);
    }
  };

  const handleTwilioTest = async () => {
    if (!patient?.contactNumber) {
      alert("Patient contact number not available.");
      return;
    }
    try {
      await api.post("/api/test/test-sms", {
        to: `+91${patient.contactNumber}`,
        body: `Hi ${patient.name}, this is a test SMS reminder from AIMedicare.`,
      });
      alert("SMS sent to " + patient.contactNumber);
    } catch (err) {
      console.error("SMS test failed:", err);
    }
  };

  const handleAddMed = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    // Validate required fields
    if (!newMed.name || !newMed.dosage || !newMed.frequency || !newMed.startDate || !newMed.endDate) {
      alert("Please fill in all required fields (name, dosage, frequency, start date, end date)");
      return;
    }

    // Validate dates
    if (new Date(newMed.startDate) >= new Date(newMed.endDate)) {
      alert("End date must be after start date");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Sending medication data:", newMed);
      const response = await api.post("/api/medication/add", newMed);
      console.log("Medication added successfully:", response.data);
      
      // Reset form
      setNewMed({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
      
      // Refresh medications list
      await fetchMedications();
      
      // Hide form
      setShowForm(false);
      
      // Show success message
      alert("Medication added successfully!");
    } catch (err) {
      console.error("Add medication failed:", err);
      alert(`Failed to add medication: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => setShowForm(prev => !prev);

  // Test API connection
  const testApiConnection = async () => {
    try {
      const response = await api.get("/api/auth/me");
      console.log("API connection test successful:", response.data);
    } catch (err) {
      console.error("API connection test failed:", err);
    }
  };

  useEffect(() => {
    fetchPatientInfo();
    fetchMedications();
    fetchAdherenceLogs();
    testApiConnection(); // Test API connection on component mount
  }, []);

  const adherenceChartData = {
    labels: medications.map(m => m.name),
    datasets: [
      {
        label: "Taken",
        data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "taken").length),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "#22c55e",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: "Missed",
        data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "missed").length),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <div className="text-purple-400 text-lg font-semibold animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Simple background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10"></div>

              <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl">🧠</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    AI MEDICARE
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">Patient Dashboard</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <button 
                  onClick={toggleForm}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                >
                  + Add Medication
                </button>
                <button 
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

        {/* Patient Info Card */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{patient?.name}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-300">
                <div className="bg-gray-700/50 p-3 rounded-xl border border-gray-600/30">
                  <p className="text-xs sm:text-sm text-purple-400 font-semibold mb-1">📧 Email</p>
                  <p className="font-mono text-white text-sm">{patient?.email}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-xl border border-gray-600/30">
                  <p className="text-xs sm:text-sm text-purple-400 font-semibold mb-1">📱 Contact</p>
                  <p className="font-mono text-white text-sm">+91 {patient?.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {patient?.caretaker && (
            <div className="mt-6 p-4 sm:p-6 bg-gray-700/50 rounded-2xl border border-gray-600/30">
              <h3 className="text-lg sm:text-xl font-bold text-purple-400 mb-4 flex items-center">
                <span className="mr-2 text-xl sm:text-2xl">👨‍⚕️</span> Assigned Caretaker
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-600/30">
                  <p className="text-purple-400 font-semibold mb-1 text-sm">Name</p>
                  <p className="font-mono text-white text-sm">{patient.caretaker.name}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-600/30">
                  <p className="text-purple-400 font-semibold mb-1 text-sm">Email</p>
                  <p className="font-mono text-white text-sm">{patient.caretaker.email}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-600/30">
                  <p className="text-purple-400 font-semibold mb-1 text-sm">Phone</p>
                  <p className="font-mono text-white text-sm">+91 {patient.caretaker.contactNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/30 shadow-lg">
          {['overview', 'medications', 'analytics', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Medication Form - Global */}
        {showForm && (
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 text-xl sm:text-2xl">➕</span> Add New Medication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {["name", "dosage", "frequency"].map((field) => (
                <div key={field}>
                  <label className="block text-purple-400 text-xs sm:text-sm font-semibold mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    className="w-full bg-gray-700/50 border border-gray-600/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    placeholder={`Enter ${field}`}
                    value={newMed[field]}
                    onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-purple-400 text-xs sm:text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700/50 border border-gray-600/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  value={newMed.startDate}
                  onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-purple-400 text-xs sm:text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full bg-gray-700/50 border border-gray-600/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  value={newMed.endDate}
                  onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-purple-400 text-xs sm:text-sm font-semibold mb-2">Reminder Times</label>
              <div className="flex flex-wrap gap-2">
                {newMed.reminders.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      className="bg-gray-700/50 border border-gray-600/30 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={time}
                      onChange={(e) => {
                        const updated = [...newMed.reminders];
                        updated[index] = e.target.value;
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    />
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors text-lg font-bold"
                      onClick={() => {
                        const updated = newMed.reminders.filter((_, i) => i !== index);
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewMed({ ...newMed, reminders: [...newMed.reminders, ""] })}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-semibold transition-all duration-300"
                >
                  + Add Time
                </button>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddMed}
                disabled={isSubmitting}
                className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-base ${
                  isSubmitting
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Medication'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Quick Stats */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="mr-2 text-xl sm:text-2xl">📊</span> Quick Stats
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 sm:p-4 bg-green-900/30 rounded-xl border border-green-500/20">
                  <div>
                    <p className="text-green-400 text-xs sm:text-sm font-semibold">Total Medications</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{medications.length}</p>
                  </div>
                  <div className="text-2xl sm:text-3xl">💊</div>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-blue-900/30 rounded-xl border border-blue-500/20">
                  <div>
                    <p className="text-blue-400 text-xs sm:text-sm font-semibold">Taken Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {logs.filter(l => l.status === "taken").length}
                    </p>
                  </div>
                  <div className="text-2xl sm:text-3xl">✅</div>
                </div>
                <div className="flex justify-between items-center p-3 sm:p-4 bg-red-900/30 rounded-xl border border-red-500/20">
                  <div>
                    <p className="text-red-400 text-xs sm:text-sm font-semibold">Missed Today</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">
                      {logs.filter(l => l.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-2xl sm:text-3xl">❌</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <span className="mr-2 text-xl sm:text-2xl">⚡</span> Recent Activity
              </h3>
              <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-xl border border-gray-600/30">
                    <div className={`w-3 h-3 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className="text-purple-400 text-xs sm:text-sm font-medium">{log.status.toUpperCase()}</p>
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-6">
            {/* Medications List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {medications.map((med) => (
                <div key={med._id} className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-white">💊 {med.name}</h4>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300 mb-4">
                    <p><span className="text-purple-400 font-semibold">Dosage:</span> {med.dosage}</p>
                    <p><span className="text-purple-400 font-semibold">Frequency:</span> {med.frequency}</p>
                    <p><span className="text-purple-400 font-semibold">Start:</span> {new Date(med.startDate).toLocaleDateString()}</p>
                    <p><span className="text-purple-400 font-semibold">End:</span> {new Date(med.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleAdherence(med._id, "taken")}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                    >
                      ✅ Taken
                    </button>
                    <button
                      onClick={() => handleAdherence(med._id, "missed")}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                    >
                      ❌ Missed
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="px-3 py-2 bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-white rounded-xl transition-all duration-300 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 text-xl sm:text-2xl">📈</span> Adherence Analytics
            </h3>
            <div className="h-64 sm:h-80 lg:h-96 bg-gray-700/30 rounded-xl p-3 sm:p-4 border border-gray-600/30">
              <Bar data={adherenceChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 text-xl sm:text-2xl">📋</span> Adherence Logs
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-6xl mb-4">📊</div>
                <p className="text-gray-300 text-lg sm:text-xl font-semibold mb-2">No logs available yet.</p>
                <p className="text-gray-500 text-sm">Start tracking your medication adherence to see data here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center space-x-4 p-3 sm:p-4 bg-gray-700/50 rounded-xl border border-gray-600/30">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className={`text-xs sm:text-sm font-medium ${log.status === 'taken' ? 'text-green-400' : 'text-red-400'}`}>
                        {log.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SMS Test Section */}
        <div className="text-center">
          <button
            onClick={handleTwilioTest}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
          >
            📱 Send Test SMS
          </button>
          {patient?.contactNumber && (
            <p className="text-gray-400 text-xs sm:text-sm mt-3 font-mono">
              Will send to: +91 {patient.contactNumber}
            </p>
          )}
        </div>
             </div>
     </div>
   );
 };

 export default PatientDashboard;
