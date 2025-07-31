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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center font-['Poppins']">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-cyan-300 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-400 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
            <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
          <div className="mt-8 text-cyan-300 font-semibold text-xl tracking-wide">INITIALIZING DASHBOARD</div>
          <div className="mt-2 text-pink-300 text-sm">Please wait while we load your data...</div>
        </div>
      </div>
    );
  }

      return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 font-['Poppins']">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                  {/* Header */}
        <header className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/30 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-500">
                  <span className="text-3xl sm:text-4xl">⚡</span>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  AI MEDICARE
                </h1>
                <p className="text-cyan-300 text-sm sm:text-base font-semibold mt-2 tracking-wide">PATIENT DASHBOARD</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button 
                onClick={toggleForm}
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl font-bold text-white transition-all duration-500 shadow-2xl hover:shadow-cyan-500/50 hover:scale-110 transform border border-cyan-400/30"
              >
                <span className="relative z-10 flex items-center space-x-3 text-lg">
                  <span className="text-2xl">⚡</span>
                  <span>ADD MEDICATION</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-br from-pink-500 to-red-600 hover:from-pink-400 hover:to-red-500 rounded-2xl font-bold text-white transition-all duration-500 shadow-2xl hover:shadow-pink-500/50 hover:scale-110 transform border border-pink-400/30"
              >
                <span className="relative z-10 text-lg">LOGOUT</span>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Patient Info Card */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/30 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-8">
              WELCOME BACK, <span className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">{patient?.name?.toUpperCase()}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
              <div className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-6 rounded-3xl border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 transform">
                <p className="text-sm text-cyan-300 font-bold mb-3 flex items-center tracking-wide">
                  <span className="mr-3 text-xl">📧</span> EMAIL
                </p>
                <p className="font-mono text-white text-lg font-semibold">{patient?.email}</p>
              </div>
              <div className="group bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-6 rounded-3xl border border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transform">
                <p className="text-sm text-blue-300 font-bold mb-3 flex items-center tracking-wide">
                  <span className="mr-3 text-xl">📱</span> CONTACT
                </p>
                <p className="font-mono text-white text-lg font-semibold">+91 {patient?.contactNumber}</p>
              </div>
            </div>
          </div>
          
          {patient?.caretaker && (
            <div className="mt-10 p-8 sm:p-10 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <h3 className="text-2xl sm:text-3xl font-black text-indigo-300 mb-8 flex items-center tracking-wide">
                <span className="mr-4 text-3xl sm:text-4xl">👨‍⚕️</span> ASSIGNED CARETAKER
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-3xl border border-purple-500/30 hover:border-purple-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 transform">
                  <p className="text-purple-300 font-bold mb-3 text-sm tracking-wide">NAME</p>
                  <p className="font-mono text-white text-lg font-semibold">{patient.caretaker.name}</p>
                </div>
                <div className="group bg-gradient-to-br from-pink-900/30 to-red-900/30 p-6 rounded-3xl border border-pink-500/30 hover:border-pink-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/30 hover:scale-105 transform">
                  <p className="text-pink-300 font-bold mb-3 text-sm tracking-wide">EMAIL</p>
                  <p className="font-mono text-white text-lg font-semibold">{patient.caretaker.email}</p>
                </div>
                <div className="group bg-gradient-to-br from-red-900/30 to-orange-900/30 p-6 rounded-3xl border border-red-500/30 hover:border-red-400/60 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/30 hover:scale-105 transform">
                  <p className="text-red-300 font-bold mb-3 text-sm tracking-wide">PHONE</p>
                  <p className="font-mono text-white text-lg font-semibold">+91 {patient.caretaker.contactNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 bg-black/40 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 shadow-2xl shadow-cyan-500/30 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {['overview', 'medications', 'analytics', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold transition-all duration-500 text-sm sm:text-base tracking-wide ${
                activeTab === tab
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/50'
                  : 'text-cyan-300 hover:text-white hover:bg-gradient-to-br hover:from-cyan-900/50 hover:to-blue-900/50 border border-cyan-500/30'
              }`}
            >
              <span className="relative z-10">{tab.toUpperCase()}</span>
              {activeTab === tab && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Add Medication Form - Global */}
        {showForm && (
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-500/30 animate-slide-in-top">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-8 flex items-center tracking-wide">
              <span className="mr-4 text-3xl sm:text-4xl">⚡</span> ADD NEW MEDICATION
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {["name", "dosage", "frequency"].map((field) => (
                <div key={field}>
                  <label className="block text-cyan-300 text-sm font-bold mb-3 tracking-wide">{field.toUpperCase()}</label>
                  <input
                    className="w-full bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-500 placeholder-cyan-300/50 font-semibold"
                    placeholder={`Enter ${field}`}
                    value={newMed[field]}
                    onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-3 tracking-wide">START DATE</label>
                <input
                  type="date"
                  className="w-full bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-500 font-semibold"
                  value={newMed.startDate}
                  onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-3 tracking-wide">END DATE</label>
                <input
                  type="date"
                  className="w-full bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-500 font-semibold"
                  value={newMed.endDate}
                  onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-cyan-300 text-sm font-bold mb-3 tracking-wide">REMINDER TIMES</label>
              <div className="flex flex-wrap gap-4">
                {newMed.reminders.map((time, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="time"
                      className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-500 font-semibold"
                      value={time}
                      onChange={(e) => {
                        const updated = [...newMed.reminders];
                        updated[index] = e.target.value;
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    />
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors text-xl font-bold hover:scale-125 transform duration-300"
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
                  className="group px-6 py-3 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white font-bold transition-all duration-500 shadow-2xl hover:shadow-cyan-500/50 hover:scale-110 transform border border-cyan-400/30"
                >
                  + ADD TIME
                </button>
              </div>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={handleAddMed}
                disabled={isSubmitting}
                className={`flex-1 group relative font-bold py-4 px-8 rounded-2xl transition-all duration-500 text-lg shadow-2xl hover:shadow-2xl hover:scale-110 transform ${
                  isSubmitting
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white border border-green-400/30'
                }`}
              >
                <span className="relative z-10">{isSubmitting ? 'ADDING...' : 'ADD MEDICATION'}</span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="group relative px-8 py-4 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-2xl transition-all duration-500 shadow-2xl hover:shadow-2xl hover:scale-110 transform border border-gray-500/30"
              >
                <span className="relative z-10">CANCEL</span>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Stats */}
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-2xl sm:text-3xl">📊</span> Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 transform">
                  <div>
                    <p className="text-green-400 text-sm font-semibold">Total Medications</p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">{medications.length}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">💊</div>
                </div>
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 transform">
                  <div>
                    <p className="text-blue-400 text-sm font-semibold">Taken Today</p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      {logs.filter(l => l.status === "taken").length}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">✅</div>
                </div>
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-2xl border border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transform">
                  <div>
                    <p className="text-red-400 text-sm font-semibold">Missed Today</p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      {logs.filter(l => l.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">❌</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/20">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3 text-2xl sm:text-3xl">⚡</span> Recent Activity
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="group flex items-center space-x-4 p-4 bg-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className={`w-3 h-3 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} group-hover:scale-125 transition-transform duration-300`}></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className={`text-sm font-medium ${log.status === 'taken' ? 'text-green-400' : 'text-red-400'}`}>{log.status.toUpperCase()}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((med) => (
                <div key={med._id} className="group bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 shadow-2xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-white">💊 {med.name}</h4>
                    <div className="w-3 h-3 bg-green-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-300 mb-6">
                    <p><span className="text-purple-400 font-semibold">Dosage:</span> {med.dosage}</p>
                    <p><span className="text-purple-400 font-semibold">Frequency:</span> {med.frequency}</p>
                    <p><span className="text-purple-400 font-semibold">Start:</span> {new Date(med.startDate).toLocaleDateString()}</p>
                    <p><span className="text-purple-400 font-semibold">End:</span> {new Date(med.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleAdherence(med._id, "taken")}
                      className="group/btn flex-1 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <span className="relative z-10">✅ Taken</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <button
                      onClick={() => handleAdherence(med._id, "missed")}
                      className="group/btn flex-1 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <span className="relative z-10">❌ Missed</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="group/btn px-3 py-2 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <span className="relative z-10">🗑️</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/20">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl">📈</span> Adherence Analytics
            </h3>
            <div className="h-64 sm:h-80 lg:h-96 bg-gray-700/50 rounded-2xl p-4 sm:p-6 border border-gray-600/30 shadow-lg">
              <Bar data={adherenceChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/20">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl">📋</span> Adherence Logs
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-6">📊</div>
                <p className="text-gray-300 text-xl sm:text-2xl font-semibold mb-3">No logs available yet.</p>
                <p className="text-gray-500 text-sm">Start tracking your medication adherence to see data here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="group flex items-center space-x-4 p-4 bg-gray-700/50 rounded-2xl border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} group-hover:scale-125 transition-transform duration-300`}></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className={`text-sm font-medium ${log.status === 'taken' ? 'text-green-400' : 'text-red-400'}`}>
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
