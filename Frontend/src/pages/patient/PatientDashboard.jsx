
// import React, { useEffect, useState } from "react";
// import api from "../../services/api";
// import { Bar } from "react-chartjs-2";
// import "chart.js/auto";

// const PatientDashboard = () => {
//   const [medications, setMedications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
//   const [patient, setPatient] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [showForm, setShowForm] = useState(false);

//   const fetchPatientInfo = async () => {
//     try {
//       const res = await api.get("/api/auth/me");
//       setPatient(res.data);
//     } catch (err) {
//       console.error("Failed to fetch patient info:", err);
//     }
//   };

//   const fetchMedications = async () => {
//     try {
//       const res = await api.get("/api/medication/my");
//       setMedications(Array.isArray(res.data.medications) ? res.data.medications : []);
//     } catch (err) {
//       console.error("Error fetching medications:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAdherenceLogs = async () => {
//     try {
//       const res = await api.get("/api/adherence/my");
//       setLogs(res.data.logs);
//     } catch (err) {
//       console.error("Failed to fetch logs:", err);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await api.delete(`/api/medication/${id}`);
//       fetchMedications();
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
//   };

//   const handleAdherence = async (id, status) => {
//     try {
//       await api.post("/api/adherence/log", { medicationId: id, status });
//       alert(`Marked as ${status}`);
//       fetchAdherenceLogs();
//     } catch (err) {
//       console.error("Adherence error:", err);
//     }
//   };

//   const handleTwilioTest = async () => {
//     if (!patient?.contactNumber) {
//       alert("Patient contact number not available.");
//       return;
//     }
//     try {
//       await api.post("/api/test/test-sms", {
//         to: `+91${patient.contactNumber}`,
//         body: `Hi ${patient.name}, this is a test SMS reminder from AIMedicare.`,
//       });
//       alert("SMS sent to " + patient.contactNumber);
//     } catch (err) {
//       console.error("SMS test failed:", err);
//     }
//   };

//   const handleAddMed = async () => {
//     try {
//       await api.post("/api/medication/add", newMed);
//       setNewMed({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
//       fetchMedications();
//       setShowForm(false);
//     } catch (err) {
//       console.error("Add medication failed:", err);
//     }
//   };

//   const toggleForm = () => setShowForm(prev => !prev);

//   useEffect(() => {
//     fetchPatientInfo();
//     fetchMedications();
//     fetchAdherenceLogs();
//   }, []);

//   const adherenceChartData = {
//     labels: medications.map(m => m.name),
//     datasets: [
//       {
//         label: "Taken",
//         data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "taken").length),
//         backgroundColor: "#22c55e"
//       },
//       {
//         label: "Missed",
//         data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "missed").length),
//         backgroundColor: "#ef4444"
//       }
//     ]
//   };

//   if (loading) return <p className="text-white text-center mt-20">Loading...</p>;

//   return (
//     <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10 space-y-10">
//       {/* Navbar */}
//       <nav className="flex justify-between items-center bg-[#1e293b] p-4 rounded-2xl shadow-xl">
//         <div className="text-2xl font-bold tracking-tight">🧠 AIMedicare</div>
//         <div className="flex gap-4 text-sm">
//           <button onClick={toggleForm} className="hover:text-blue-400 transition">Add Medication</button>
//           <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="hover:text-red-400 transition">Logout</button>
//         </div>
//       </nav>

//       {/* Patient Info */}
//       <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//         <h2 className="text-xl font-semibold mb-2">Welcome, {patient?.name}</h2>
//         <div className="text-sm space-y-1">
//           <p><span className="text-gray-400">Email:</span> {patient?.email}</p>
//           <p><span className="text-gray-400">Phone:</span> {patient?.contactNumber}</p>
//         </div>
//         {patient?.caretaker && (
//           <div className="mt-4 text-sm">
//             <h3 className="text-md font-semibold">Caretaker</h3>
//             <p><span className="text-gray-400">Name:</span> {patient.caretaker.name}</p>
//             <p><span className="text-gray-400">Email:</span> {patient.caretaker.email}</p>
//             <p><span className="text-gray-400">Phone:</span> {patient.caretaker.contactNumber}</p>
//           </div>
//         )}
//       </section>

//       {/* Form */}
//       {showForm && (
//         <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl space-y-4">
//           <h3 className="text-lg font-semibold">Add Medication</h3>
//           <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-3">
//             {["name", "dosage", "frequency"].map((field) => (
//               <input key={field} className="bg-[#334155] p-2 rounded-xl" placeholder={field} value={newMed[field]} onChange={e => setNewMed({ ...newMed, [field]: e.target.value })} />
//             ))}
//             <input type="date" className="bg-[#334155] p-2 rounded-xl" value={newMed.startDate} onChange={e => setNewMed({ ...newMed, startDate: e.target.value })} />
//             <input type="date" className="bg-[#334155] p-2 rounded-xl" value={newMed.endDate} onChange={e => setNewMed({ ...newMed, endDate: e.target.value })} />
//             <div className="col-span-full space-y-2">
//               <label className="text-gray-400 text-sm">Reminder Times (HH:mm)</label>
//               <div className="flex flex-wrap gap-2">
//                 {newMed.reminders.map((time, index) => (
//                   <div key={index} className="flex items-center gap-1">
//                     <input type="time" className="bg-[#334155] p-2 rounded-xl" value={time} onChange={e => { const updated = [...newMed.reminders]; updated[index] = e.target.value; setNewMed({ ...newMed, reminders: updated }); }} />
//                     <button className="text-red-400" onClick={() => setNewMed({ ...newMed, reminders: newMed.reminders.filter((_, i) => i !== index) })}>&times;</button>
//                   </div>
//                 ))}
//                 <button onClick={() => setNewMed({ ...newMed, reminders: [...newMed.reminders, ""] })} className="text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded-xl">+ Add Time</button>
//               </div>
//             </div>
//             <button onClick={handleAddMed} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl col-span-full">Submit</button>
//           </div>
//         </section>
//       )}

//       {/* Chart */}
//       <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//         <h3 className="text-lg font-semibold mb-4">📊 Adherence Trend</h3>
//         <Bar data={adherenceChartData} />
//       </section>

//       {/* Medications */}
//       <section className="space-y-4">
//         {medications.map((med) => (
//           <div key={med._id} className="bg-[#1e293b] p-4 rounded-2xl shadow-md">
//             <h4 className="text-lg font-semibold">💊 {med.name}</h4>
//             <p className="text-sm text-gray-300">Dosage: {med.dosage}</p>
//             <p className="text-sm text-gray-300">Frequency: {med.frequency}</p>
//             <p className="text-sm text-gray-300">Start: {new Date(med.startDate).toLocaleDateString()}</p>
//             <p className="text-sm text-gray-300">End: {new Date(med.endDate).toLocaleDateString()}</p>
//             <div className="mt-4 flex flex-wrap gap-2">
//               <button onClick={() => handleAdherence(med._id, "taken")} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Taken</button>
//               <button onClick={() => handleAdherence(med._id, "missed")} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Missed</button>
//               <button onClick={() => handleDelete(med._id)} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded">Delete</button>
//             </div>
//           </div>
//         ))}
//       </section>

//       {/* Logs */}
//       <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
//         <h3 className="text-lg font-semibold mb-4">🗂 Adherence Logs</h3>
//         {logs.length === 0 ? (
//           <p className="text-gray-400 text-sm">No logs available.</p>
//         ) : (
//           <ul className="space-y-2 text-sm">
//             {logs.map(log => (
//               <li key={log._id} className="bg-[#334155] p-3 rounded-xl">
//                 <p>Medication: {log.medication?.name}</p>
//                 <p>Status: {log.status}</p>
//                 <p>Date: {new Date().toLocaleString()}</p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       {/* SMS */}
//       <section className="text-center">
//         <button onClick={handleTwilioTest} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl">Send Test SMS</button>
//         {patient?.contactNumber && <p className="text-sm text-gray-400 mt-2">Sending to: {patient.contactNumber}</p>}
//       </section>
//     </div>
//   );
// };

// export default PatientDashboard;

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const lightGradient = "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50";
const cardGlass = "bg-blue-50/90 backdrop-blur-xl border border-blue-200 shadow-xl";
const cardAlt = "bg-purple-50/90 backdrop-blur-xl border border-purple-200 shadow-lg";
const cardPink = "bg-pink-50/90 backdrop-blur-xl border border-pink-200 shadow-lg";
const cardTeal = "bg-teal-50/90 backdrop-blur-xl border border-teal-200 shadow-lg";
const sectionTitle = "text-2xl font-bold text-purple-700";
const buttonBase = "rounded-xl px-4 py-2 font-semibold shadow transition-all duration-300";
const buttonGrad = "bg-blue-500 text-white hover:bg-blue-600";
const buttonDelete = "bg-red-500 text-white hover:bg-red-600";
const buttonGreen = "bg-green-500 text-white hover:bg-green-600";
const buttonGray = "bg-gray-300 text-gray-700 hover:bg-gray-400";

const PatientDashboard = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);

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
        backgroundColor: "rgba(147,51,234,0.7)"
      },
      {
        label: "Missed",
        data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "missed").length),
        backgroundColor: "rgba(236,72,153,0.7)"
      }
    ]
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className={`min-h-screen ${lightGradient} p-0 sm:p-4 space-y-6 font-sans`}>
      {/* Navbar */}
      <nav className={`${cardGlass} flex flex-col sm:flex-row justify-between items-center p-4 rounded-2xl gap-4`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <span className="text-xl font-bold text-purple-700">AIMedicare</span>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleForm} className={`${buttonBase} ${buttonGrad}`}>Add Medication</button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className={`${buttonBase} ${buttonDelete}`}>Logout</button>
        </div>
      </nav>

      {/* Welcome Info */}
      <div className={`${cardAlt} p-6 rounded-2xl flex flex-col md:flex-row md:justify-between gap-6`}>
        <div>
          <h2 className={sectionTitle}>Welcome, {patient?.name}</h2>
          <p className="text-gray-700"><strong>Email:</strong> {patient?.email}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {patient?.contactNumber}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-teal-600 mb-2">Your Caretaker</h3>
          {patient?.caretaker ? (
            <div className="space-y-1 text-gray-700">
              <p><strong>Name:</strong> {patient.caretaker.name}</p>
              <p><strong>Email:</strong> {patient.caretaker.email}</p>
              <p><strong>Phone:</strong> {patient.caretaker.contactNumber}</p>
            </div>
          ) : (
            <p className="text-gray-400">No caretaker assigned yet.</p>
          )}
        </div>
      </div>

      {/* Medication Form */}
      {showForm && (
        <div className={`${cardPink} p-6 rounded-2xl`}>
          <h3 className={sectionTitle}>Add Medication</h3>
          <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-2">
            {['name', 'dosage', 'frequency'].map(field => (
              <input
                key={field}
                className="bg-blue-50/80 border border-pink-200 text-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-300"
                placeholder={field}
                value={newMed[field]}
                onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
              />
            ))}
            <input
              type="date"
              className="bg-blue-50/80 border border-pink-200 text-gray-700 p-2 rounded"
              value={newMed.startDate}
              onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
            />
            <input
              type="date"
              className="bg-blue-50/80 border border-pink-200 text-gray-700 p-2 rounded"
              value={newMed.endDate}
              onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
            />

            {/* Reminder Time Inputs */}
            <div className="col-span-full">
              <label className="block text-sm text-gray-500 mb-1">Reminder Times (HH:mm)</label>
              <div className="flex flex-wrap gap-2">
                {newMed.reminders.map((time, index) => (
                  <div key={index} className="flex items-center gap-1">
                                          <input
                        type="time"
                        className="bg-blue-50/80 border border-pink-200 text-gray-700 p-2 rounded"
                        value={time}
                      onChange={(e) => {
                        const updated = [...newMed.reminders];
                        updated[index] = e.target.value;
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    />
                    <button
                      className="text-pink-500 hover:text-pink-700"
                      onClick={() => {
                        const updated = newMed.reminders.filter((_, i) => i !== index);
                        setNewMed({ ...newMed, reminders: updated });
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewMed({ ...newMed, reminders: [...newMed.reminders, ""] })}
                  className={`${buttonBase} ${buttonGray}`}
                >
                  + Add Time
                </button>
              </div>
            </div>

            <button
              onClick={handleAddMed}
              className={`${buttonBase} ${buttonGrad} col-span-full`}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Adherence Chart */}
      <div className={`${cardTeal} p-6 rounded-2xl`}>
        <h3 className={sectionTitle}>Adherence Trend</h3>
        <div className="w-full h-64 sm:h-80">
          <Bar data={adherenceChartData} options={{
            responsive: true,
            plugins: { legend: { labels: { color: "#334155" } } },
            scales: {
              x: { ticks: { color: "#64748b" }, grid: { color: "#e0e7ef" } },
              y: { ticks: { color: "#64748b" }, grid: { color: "#e0e7ef" } }
            }
          }} />
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {medications.map((med, index) => (
          <div key={med._id} className={`${index % 2 === 0 ? cardAlt : cardPink} p-4 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4`}>
            <div>
              <h4 className="text-lg font-semibold text-purple-600">{med.name}</h4>
              <p className="text-gray-700">Dosage: {med.dosage}</p>
              <p className="text-gray-700">Frequency: {med.frequency}</p>
              <p className="text-gray-500">Start: {
                med.startDate ? 
                  (() => {
                    try {
                      return new Date(med.startDate).toLocaleDateString();
                    } catch (error) {
                      return "Invalid date";
                    }
                  })() 
                  : "Not set"
              }</p>
              <p className="text-gray-500">End: {
                med.endDate ? 
                  (() => {
                    try {
                      return new Date(med.endDate).toLocaleDateString();
                    } catch (error) {
                      return "Invalid date";
                    }
                  })() 
                  : "Not set"
              }</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAdherence(med._id, "taken")} className={`${buttonBase} ${buttonGreen}`}>Taken</button>
              <button onClick={() => handleAdherence(med._id, "missed")} className={`${buttonBase} ${buttonDelete}`}>Missed</button>
              <button onClick={() => handleDelete(med._id)} className={`${buttonBase} ${buttonGray}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Adherence Logs */}
      <div className={`${cardGlass} p-6 rounded-2xl`}>
        <h3 className={sectionTitle}>Adherence Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs available.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log._id} className="bg-blue-50/80 border border-blue-200 p-3 rounded">
                <p className="text-purple-600 font-semibold">{log.medication?.name}</p>
                <p className="text-gray-700">Status: <span className={log.status === "taken" ? "text-green-500" : "text-pink-500"}>{log.status}</span></p>
                <p className="text-gray-400">
                  {log.takenAt ? 
                    (() => {
                      try {
                        const date = new Date(log.takenAt);
                        if (isNaN(date.getTime())) {
                          return "Date not available";
                        }
                        return date.toLocaleString();
                      } catch (error) {
                        return "Date not available";
                      }
                    })() 
                    : "Date not available"
                  }
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Twilio Test */}
      <div className="pt-6">
        <button onClick={handleTwilioTest} className={`${buttonBase} ${buttonGrad}`}>Send Test SMS</button>
        {patient?.contactNumber && <p className="text-sm text-gray-500 mt-2">SMS will be sent to: {patient.contactNumber}</p>}
      </div>
    </div>
  );
};

export default PatientDashboard;