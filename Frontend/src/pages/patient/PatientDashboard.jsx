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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 text-xl font-bold tracking-wider animate-pulse">
            INITIALIZING NEURAL INTERFACE...
          </div>
          <div className="text-purple-300 text-sm mt-2 animate-pulse">
            Loading patient data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

             {/* Grid Pattern */}
       <div className="absolute inset-0 opacity-30" style={{
         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
       }}></div>

      <div className="relative z-10 px-6 py-8 space-y-8">
        {/* Futuristic Header */}
        <header className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🧠</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  AI MEDICARE
                </h1>
                <p className="text-purple-300 text-sm tracking-wider">NEURAL HEALTH INTERFACE</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleForm}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              >
                + ADD MEDICATION
              </button>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* Patient Info Card */}
        <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{patient?.name}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-200">
                <div>
                  <p className="text-sm text-purple-300">📧 Email</p>
                  <p className="font-mono">{patient?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">📱 Contact</p>
                  <p className="font-mono">+91 {patient?.contactNumber}</p>
                </div>
              </div>
            </div>
          </div>
          
          {patient?.caretaker && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-2xl border border-cyan-500/30">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">👨‍⚕️</span> ASSIGNED CARETAKER
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-cyan-300">Name</p>
                  <p className="font-mono text-white">{patient.caretaker.name}</p>
                </div>
                <div>
                  <p className="text-cyan-300">Email</p>
                  <p className="font-mono text-white">{patient.caretaker.email}</p>
                </div>
                <div>
                  <p className="text-cyan-300">Phone</p>
                  <p className="font-mono text-white">+91 {patient.caretaker.contactNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border border-purple-500/30">
          {['overview', 'medications', 'analytics', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-purple-500/20'
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
            <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">📊</span> QUICK STATS
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl border border-green-500/30">
                  <div>
                    <p className="text-green-300 text-sm">Total Medications</p>
                    <p className="text-2xl font-bold text-white">{medications.length}</p>
                  </div>
                  <div className="text-3xl">💊</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-2xl border border-blue-500/30">
                  <div>
                    <p className="text-blue-300 text-sm">Taken Today</p>
                    <p className="text-2xl font-bold text-white">
                      {logs.filter(l => l.status === "taken").length}
                    </p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-900/50 to-pink-900/50 rounded-2xl border border-red-500/30">
                  <div>
                    <p className="text-red-300 text-sm">Missed Today</p>
                    <p className="text-2xl font-bold text-white">
                      {logs.filter(l => l.status === "missed").length}
                    </p>
                  </div>
                  <div className="text-3xl">❌</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">⚡</span> RECENT ACTIVITY
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {logs.slice(0, 5).map((log, index) => (
                  <div key={log._id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{log.medication?.name}</p>
                      <p className="text-purple-300 text-sm">{log.status.toUpperCase()}</p>
                    </div>
                    <div className="text-purple-300 text-xs">
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
            {/* Add Medication Form */}
            {showForm && (
              <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-2">➕</span> ADD NEW MEDICATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {["name", "dosage", "frequency"].map((field) => (
                    <div key={field}>
                      <label className="block text-purple-300 text-sm mb-2">{field.toUpperCase()}</label>
                      <input
                        className="w-full bg-slate-700/50 border border-purple-500/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        placeholder={`Enter ${field}`}
                        value={newMed[field]}
                        onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">START DATE</label>
                    <input
                      type="date"
                      className="w-full bg-slate-700/50 border border-purple-500/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      value={newMed.startDate}
                      onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-purple-300 text-sm mb-2">END DATE</label>
                    <input
                      type="date"
                      className="w-full bg-slate-700/50 border border-purple-500/30 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                      value={newMed.endDate}
                      onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-purple-300 text-sm mb-2">REMINDER TIMES</label>
                  <div className="flex flex-wrap gap-2">
                    {newMed.reminders.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="time"
                          className="bg-slate-700/50 border border-purple-500/30 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={time}
                          onChange={(e) => {
                            const updated = [...newMed.reminders];
                            updated[index] = e.target.value;
                            setNewMed({ ...newMed, reminders: updated });
                          }}
                        />
                        <button
                          className="text-red-400 hover:text-red-300 transition-colors"
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
                <button
                  onClick={handleAddMed}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  ADD MEDICATION
                </button>
              </div>
            )}

            {/* Medications List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((med) => (
                <div key={med._id} className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">💊 {med.name}</h4>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="space-y-2 text-sm text-purple-200 mb-4">
                    <p><span className="text-purple-300">Dosage:</span> {med.dosage}</p>
                    <p><span className="text-purple-300">Frequency:</span> {med.frequency}</p>
                    <p><span className="text-purple-300">Start:</span> {new Date(med.startDate).toLocaleDateString()}</p>
                    <p><span className="text-purple-300">End:</span> {new Date(med.endDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAdherence(med._id, "taken")}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      ✅ Taken
                    </button>
                    <button
                      onClick={() => handleAdherence(med._id, "missed")}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 px-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      ❌ Missed
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="px-3 py-2 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300"
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
          <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📈</span> ADHERENCE ANALYTICS
            </h3>
            <div className="h-96">
              <Bar data={adherenceChartData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📋</span> ADHERENCE LOGS
            </h3>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-purple-300 text-lg">No logs available yet.</p>
                <p className="text-purple-400 text-sm">Start tracking your medication adherence to see data here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div key={log._id} className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                    <div className={`w-4 h-4 rounded-full ${log.status === 'taken' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{log.medication?.name}</p>
                      <p className={`text-sm font-medium ${log.status === 'taken' ? 'text-green-300' : 'text-red-300'}`}>
                        {log.status.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-purple-300 text-sm font-mono">
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
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            📱 SEND TEST SMS
          </button>
          {patient?.contactNumber && (
            <p className="text-purple-300 text-sm mt-3">
              Will send to: +91 {patient.contactNumber}
            </p>
          )}
        </div>
             </div>
     </div>
   );
 };

 export default PatientDashboard;
