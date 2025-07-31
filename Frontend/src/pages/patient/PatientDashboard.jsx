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
          color: '#475569',
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
          color: '#64748b'
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: 'rgba(100, 116, 139, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          </div>
          <div className="mt-6 text-blue-600 font-medium text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

      return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-['Inter']">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                  {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <span className="text-2xl sm:text-3xl">🧠</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  AI Medicare
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium mt-1">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button 
                onClick={toggleForm}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span className="text-lg">+</span>
                  <span>Add Medication</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-2xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <span className="relative z-10">Logout</span>
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Patient Info Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <span className="text-3xl sm:text-4xl">👤</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Welcome back, <span className="bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">{patient?.name}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                  <p className="text-sm text-blue-600 font-semibold mb-2 flex items-center">
                    <span className="mr-2">📧</span> Email
                  </p>
                  <p className="font-mono text-slate-700 text-sm">{patient?.email}</p>
                </div>
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                  <p className="text-sm text-blue-600 font-semibold mb-2 flex items-center">
                    <span className="mr-2">📱</span> Contact
                  </p>
                  <p className="font-mono text-slate-700 text-sm">+91 {patient?.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {patient?.caretaker && (
            <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-6 flex items-center">
                <span className="mr-3 text-2xl sm:text-3xl">👨‍⚕️</span> Assigned Caretaker
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group bg-white/60 p-4 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                  <p className="text-indigo-600 font-semibold mb-2 text-sm">Name</p>
                  <p className="font-mono text-slate-700 text-sm">{patient.caretaker.name}</p>
                </div>
                <div className="group bg-white/60 p-4 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                  <p className="text-indigo-600 font-semibold mb-2 text-sm">Email</p>
                  <p className="font-mono text-slate-700 text-sm">{patient.caretaker.email}</p>
                </div>
                <div className="group bg-white/60 p-4 rounded-2xl border border-indigo-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                  <p className="text-indigo-600 font-semibold mb-2 text-sm">Phone</p>
                  <p className="font-mono text-slate-700 text-sm">+91 {patient.caretaker.contactNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 bg-white/80 backdrop-blur-xl rounded-3xl p-3 border border-white/20 shadow-xl shadow-blue-500/10 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          {['overview', 'medications', 'analytics', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              {activeTab === tab && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          ))}
        </div>

        {/* Add Medication Form - Global */}
        {showForm && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl">➕</span> Add New Medication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {["name", "dosage", "frequency"].map((field) => (
                <div key={field}>
                  <label className="block text-blue-600 text-sm font-semibold mb-2">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    className="w-full bg-white/60 border border-blue-100 text-slate-700 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-slate-400"
                    placeholder={`Enter ${field}`}
                    value={newMed[field]}
                    onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-blue-600 text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-white/60 border border-blue-100 text-slate-700 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  value={newMed.startDate}
                  onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-blue-600 text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full bg-white/60 border border-blue-100 text-slate-700 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  value={newMed.endDate}
                  onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-blue-600 text-sm font-semibold mb-2">Reminder Times</label>
              <div className="flex flex-wrap gap-3">
                {newMed.reminders.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      className="bg-white/60 border border-blue-100 text-slate-700 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      value={time}
                      onChange={(e) => {
                        const updated = [...newMed.reminders];
                        updated[index] = e.target.value;
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    />
                    <button
                      className="text-red-500 hover:text-red-600 transition-colors text-lg font-bold hover:scale-110 transform"
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
                  className="group px-4 py-2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  + Add Time
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddMed}
                disabled={isSubmitting}
                className={`flex-1 group relative font-semibold py-3 px-6 rounded-2xl transition-all duration-300 text-base shadow-lg hover:shadow-xl hover:scale-105 transform ${
                  isSubmitting
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                <span className="relative z-10">{isSubmitting ? 'Adding...' : 'Add Medication'}</span>
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="group relative px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <span className="relative z-10">Cancel</span>
                <div className="absolute inset-0 bg-slate-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="mr-3 text-2xl sm:text-3xl">📊</span> Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
                  <div>
                    <p className="text-green-600 text-sm font-semibold">Total Medications</p>
                    <p className="text-3xl sm:text-4xl font-bold text-slate-800">{medications.length}</p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">💊</div>
                </div>
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold">Taken Today</p>
                    <p className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {logs.filter(l => l.status === "taken").length}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">✅</div>
                </div>
                <div className="group flex justify-between items-center p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100 hover:border-red-200 transition-all duration-300 hover:shadow-lg hover:scale-105 transform">
                  <div>
                    <p className="text-red-600 text-sm font-semibold">Missed Today</p>
                    <p className="text-3xl sm:text-4xl font-bold text-slate-800">
                      {logs.filter(l => l.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">❌</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="mr-3 text-2xl sm:text-3xl">⚡</span> Recent Activity
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="group flex items-center space-x-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                    <div className={`w-3 h-3 rounded-full ${log.status === 'taken' ? 'bg-green-500' : 'bg-red-500'} group-hover:scale-125 transition-transform duration-300`}></div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className={`text-sm font-medium ${log.status === 'taken' ? 'text-green-600' : 'text-red-600'}`}>{log.status.toUpperCase()}</p>
                    </div>
                    <div className="text-slate-500 text-xs font-mono">
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
                <div key={med._id} className="group bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 transform">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-800">💊 {med.name}</h4>
                    <div className="w-3 h-3 bg-green-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  </div>
                  <div className="space-y-3 text-sm text-slate-600 mb-6">
                    <p><span className="text-blue-600 font-semibold">Dosage:</span> {med.dosage}</p>
                    <p><span className="text-blue-600 font-semibold">Frequency:</span> {med.frequency}</p>
                    <p><span className="text-blue-600 font-semibold">Start:</span> {new Date(med.startDate).toLocaleDateString()}</p>
                    <p><span className="text-blue-600 font-semibold">End:</span> {new Date(med.endDate).toLocaleDateString()}</p>
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
                      className="group/btn px-3 py-2 bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105 transform"
                    >
                      <span className="relative z-10">🗑️</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl">📈</span> Adherence Analytics
            </h3>
            <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-lg">
              <Bar data={adherenceChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="mr-3 text-2xl sm:text-3xl">📋</span> Adherence Logs
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-6">📊</div>
                <p className="text-slate-700 text-xl sm:text-2xl font-semibold mb-3">No logs available yet.</p>
                <p className="text-slate-500 text-sm">Start tracking your medication adherence to see data here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="group flex items-center space-x-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${log.status === 'taken' ? 'bg-green-500' : 'bg-red-500'} group-hover:scale-125 transition-transform duration-300`}></div>
                    <div className="flex-1">
                      <p className="text-slate-800 font-semibold text-sm sm:text-base">{log.medication?.name}</p>
                      <p className={`text-sm font-medium ${log.status === 'taken' ? 'text-green-600' : 'text-red-600'}`}>
                        {log.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-slate-500 text-xs font-mono">
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
