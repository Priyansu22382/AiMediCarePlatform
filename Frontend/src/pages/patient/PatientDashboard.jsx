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
    try {
      await api.post("/api/medication/add", newMed);
      setNewMed({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
      fetchMedications();
      setShowForm(false);
    } catch (err) {
      console.error("Add medication failed:", err);
    }
  };

  const toggleForm = () => setShowForm(prev => !prev);

  useEffect(() => {
    fetchPatientInfo();
    fetchMedications();
    fetchAdherenceLogs();
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background for loading */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-40 w-40 border-4 border-purple-500/30 mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-40 w-40 border-4 border-transparent border-t-purple-500 mx-auto mb-6" style={{animationDuration: '1.5s'}}></div>
            <div className="absolute inset-2 animate-spin rounded-full h-36 w-36 border-4 border-transparent border-t-blue-500 mx-auto mb-6" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
          </div>
          <div className="text-purple-400 text-2xl font-bold tracking-widest animate-pulse mb-2">
            INITIALIZING NEURAL INTERFACE
          </div>
          <div className="text-gray-400 text-sm tracking-wide animate-pulse">
            Loading patient data...
          </div>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-pink-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-6 py-8 space-y-8">
        {/* Futuristic Header */}
        <header className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <span className="text-3xl">🧠</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                  AI MEDICARE
                </h1>
                <p className="text-gray-400 text-sm tracking-widest font-medium">NEURAL HEALTH INTERFACE</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleForm}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                + ADD MEDICATION
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-red-500/25 hover:shadow-red-500/40"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* Patient Info Card */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <span className="text-4xl">👤</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-20 animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-white mb-3">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">{patient?.name}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                  <p className="text-sm text-purple-400 font-semibold mb-1">📧 Email</p>
                  <p className="font-mono text-white">{patient?.email}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50">
                  <p className="text-sm text-purple-400 font-semibold mb-1">📱 Contact</p>
                  <p className="font-mono text-white">+91 {patient?.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {patient?.caretaker && (
            <div className="mt-8 p-8 bg-gradient-to-r from-gray-800/80 to-black/80 rounded-3xl border border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center">
                <span className="mr-3 text-2xl">👨‍⚕️</span> ASSIGNED CARETAKER
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/50">
                  <p className="text-purple-400 font-semibold mb-2">Name</p>
                  <p className="font-mono text-white text-lg">{patient.caretaker.name}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/50">
                  <p className="text-purple-400 font-semibold mb-2">Email</p>
                  <p className="font-mono text-white text-lg">{patient.caretaker.email}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-700/50">
                  <p className="text-purple-400 font-semibold mb-2">Phone</p>
                  <p className="font-mono text-white text-lg">+91 {patient.caretaker.contactNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-3 bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-3 border border-gray-700/50 shadow-xl">
          {['overview', 'medications', 'analytics', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/25 transform scale-105'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 hover:shadow-lg'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
              <h3 className="text-2xl font-black text-white mb-8 flex items-center">
                <span className="mr-3 text-3xl">📊</span> QUICK STATS
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-3xl border border-green-500/30 shadow-xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105">
                  <div>
                    <p className="text-green-400 text-sm font-semibold tracking-wide">Total Medications</p>
                    <p className="text-4xl font-black text-white">{medications.length}</p>
                  </div>
                  <div className="text-5xl">💊</div>
                </div>
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-3xl border border-blue-500/30 shadow-xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105">
                  <div>
                    <p className="text-blue-400 text-sm font-semibold tracking-wide">Taken Today</p>
                    <p className="text-4xl font-black text-white">
                      {logs.filter(l => l.status === "taken").length}
                    </p>
                  </div>
                  <div className="text-5xl">✅</div>
                </div>
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-red-900/50 to-pink-900/50 rounded-3xl border border-red-500/30 shadow-xl hover:shadow-red-500/20 transition-all duration-300 transform hover:scale-105">
                  <div>
                    <p className="text-red-400 text-sm font-semibold tracking-wide">Missed Today</p>
                    <p className="text-4xl font-black text-white">
                      {logs.filter(l => l.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-5xl">❌</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
              <h3 className="text-2xl font-black text-white mb-8 flex items-center">
                <span className="mr-3 text-3xl">⚡</span> RECENT ACTIVITY
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                    <div className={`w-4 h-4 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} animate-pulse shadow-lg`}></div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-lg">{log.medication?.name}</p>
                      <p className="text-purple-400 text-sm font-semibold">{log.status.toUpperCase()}</p>
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
          <div className="space-y-8">
            {/* Add Medication Form */}
            {showForm && (
              <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center">
                  <span className="mr-3 text-3xl">➕</span> ADD NEW MEDICATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {["name", "dosage", "frequency"].map((field) => (
                    <div key={field}>
                      <label className="block text-purple-400 text-sm font-semibold mb-3 tracking-wide">{field.toUpperCase()}</label>
                      <input
                        className="w-full bg-gray-800/50 border border-gray-700/50 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-lg"
                        placeholder={`Enter ${field}`}
                        value={newMed[field]}
                        onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-purple-400 text-sm font-semibold mb-3 tracking-wide">START DATE</label>
                    <input
                      type="date"
                      className="w-full bg-gray-800/50 border border-gray-700/50 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-lg"
                      value={newMed.startDate}
                      onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-purple-400 text-sm font-semibold mb-3 tracking-wide">END DATE</label>
                    <input
                      type="date"
                      className="w-full bg-gray-800/50 border border-gray-700/50 text-white p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-lg"
                      value={newMed.endDate}
                      onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-purple-400 text-sm font-semibold mb-3 tracking-wide">REMINDER TIMES</label>
                  <div className="flex flex-wrap gap-3">
                    {newMed.reminders.map((time, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="time"
                          className="bg-gray-800/50 border border-gray-700/50 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-lg"
                          value={time}
                          onChange={(e) => {
                            const updated = [...newMed.reminders];
                            updated[index] = e.target.value;
                            setNewMed({ ...newMed, reminders: updated });
                          }}
                        />
                        <button
                          className="text-red-400 hover:text-red-300 transition-colors text-xl font-bold"
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
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                    >
                      + Add Time
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddMed}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25 text-lg"
                >
                  ADD MEDICATION
                </button>
              </div>
            )}

            {/* Medications List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {medications.map((med) => (
                <div key={med._id} className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-black text-white">💊 {med.name}</h4>
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-300 mb-6">
                    <p><span className="text-purple-400 font-semibold">Dosage:</span> {med.dosage}</p>
                    <p><span className="text-purple-400 font-semibold">Frequency:</span> {med.frequency}</p>
                    <p><span className="text-purple-400 font-semibold">Start:</span> {new Date(med.startDate).toLocaleDateString()}</p>
                    <p><span className="text-purple-400 font-semibold">End:</span> {new Date(med.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAdherence(med._id, "taken")}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ✅ Taken
                    </button>
                    <button
                      onClick={() => handleAdherence(med._id, "missed")}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ❌ Missed
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="px-4 py-3 bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-white rounded-2xl transition-all duration-300 shadow-lg"
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
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center">
              <span className="mr-3 text-3xl">📈</span> ADHERENCE ANALYTICS
            </h3>
            <div className="h-96 bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
              <Bar data={adherenceChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-2xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center">
              <span className="mr-3 text-3xl">📋</span> ADHERENCE LOGS
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">📊</div>
                <p className="text-gray-300 text-xl font-semibold mb-2">No logs available yet.</p>
                <p className="text-gray-500 text-sm">Start tracking your medication adherence to see data here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center space-x-6 p-6 bg-gray-800/50 rounded-3xl border border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                    <div className={`w-5 h-5 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} animate-pulse shadow-lg`}></div>
                    <div className="flex-1">
                      <p className="text-white font-black text-lg">{log.medication?.name}</p>
                      <p className={`text-sm font-bold ${log.status === 'taken' ? 'text-green-400' : 'text-red-400'}`}>
                        {log.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
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
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-3xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/40 text-lg"
          >
            📱 SEND TEST SMS
          </button>
          {patient?.contactNumber && (
            <p className="text-gray-400 text-sm mt-4 font-mono">
              Will send to: +91 {patient.contactNumber}
            </p>
          )}
        </div>
             </div>
     </div>
   );
 };

 export default PatientDashboard;
