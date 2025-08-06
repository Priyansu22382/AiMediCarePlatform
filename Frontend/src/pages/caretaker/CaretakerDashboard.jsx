// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// import { saveAs } from "file-saver";

// const CaretakerDashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [summary, setSummary] = useState({ totalPatients: 0, totalMedications: 0 });
//   const [patients, setPatients] = useState([]);
//   const [showAssignForm, setShowAssignForm] = useState(false);
//   const [patientForm, setPatientForm] = useState({
//     email: "",
//     password: "",
//   });
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [medications, setMedications] = useState([]);
//   const [logs, setLogs] = useState([]);
//   const [filteredLogs, setFilteredLogs] = useState([]);
//   const [newStatus, setNewStatus] = useState("taken");
//   const [selectedMedId, setSelectedMedId] = useState("");
//   const [filterMissed, setFilterMissed] = useState(false);
//   const [smsStatus, setSmsStatus] = useState({});
//   const [editingMed, setEditingMed] = useState(null);
//   const [medForm, setMedForm] = useState({
//     name: "",
//     dosage: "",
//     frequency: "",
//     startDate: "",
//     endDate: "",
//     reminders: [],
//   });

//   // Fetch dashboard data
//   const fetchDashboard = async () => {
//     try {
//       const { data } = await api.get("/api/caretaker/dashboard", { withCredentials: true });
//       setSummary({
//         totalPatients: data.totalPatients || 0,
//         totalMedications: data.totalMedications || 0,
//       });
//       setPatients(data.patients || []);
//       setLoading(false);
//     } catch (err) {
//       setError("Failed to load dashboard data");
//       console.error("Error fetching dashboard:", err.response?.data || err);
//     }
//   };

//   // Assign patient
//   const assignPatient = async () => {
//     const { email, password } = patientForm;
//     if (!email || !password) {
//       setError("Please provide both email and password");
//       return;
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError("Please enter a valid email address");
//       return;
//     }
//     try {
//       console.log("Verifying patient with email:", email);
//       const verifyResponse = await api.post("/api/caretaker/verify-patient", { email, password }, { withCredentials: true });
//       const patientId = verifyResponse.data.patientId;
//       if (!patientId) {
//         throw new Error("Patient ID not returned from verification");
//       }
//       console.log("Patient verified with ID:", patientId);
//       await api.put(`/api/caretaker/assign/${patientId}`, {}, { withCredentials: true });
//       alert("Patient assigned successfully!");
//       setPatientForm({ email: "", password: "" });
//       setShowAssignForm(false);
//       setError("");
//       fetchDashboard();
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Failed to verify or assign patient";
//       console.error("Failed to verify or assign patient:", err.response?.data || err);
//       setError(errorMessage);
//     }
//   };

//   // Unassign patient
//   const unassignPatient = async (patientId) => {
//     try {
//       await api.put(`/api/caretaker/unassign/${patientId}`, {}, { withCredentials: true });
//       alert("Patient unassigned successfully!");
//       setSelectedPatient(null);
//       setMedications([]);
//       setLogs([]);
//       setFilteredLogs([]);
//       setError("");
//       fetchDashboard();
//     } catch (err) {
//       setError("Failed to unassign patient");
//       console.error("Failed to unassign patient:", err.response?.data || err);
//     }
//   };

//   // Fetch medications and logs
//   const fetchMedications = async (patientId) => {
//     try {
//       setSelectedPatient(patientId);
//       const { data } = await api.get(`/api/caretaker/patient/${patientId}/medications`, { withCredentials: true });
//       setMedications(data.medications || []);
//       const logsRes = await api.get(`/api/caretaker/report/${patientId}`, { withCredentials: true });
//       setLogs(logsRes.data.logs || []);
//       setFilteredLogs(logsRes.data.logs || []);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch medications or logs");
//       console.error("Failed to fetch meds or logs:", err.response?.data || err);
//     }
//   };

//   // Trigger SMS reminder
//   const triggerReminder = async (medicationId) => {
//     try {
//       const response = await api.post("/api/caretaker/send-reminder", { patientId: selectedPatient, medicationId }, { withCredentials: true });
//       setSmsStatus(prev => ({ ...prev, [medicationId]: response.data.smsStatus || "Delivered" }));
//       alert("Reminder sent!");
//       setError("");
//     } catch (err) {
//       setSmsStatus(prev => ({ ...prev, [medicationId]: "Failed" }));
//       setError("Failed to send reminder");
//       console.error("Failed to send reminder:", err.response?.data || err);
//     }
//   };

//   // Log adherence
//   const handleLogSubmit = async () => {
//     if (!selectedMedId) {
//       setError("Please select a medication");
//       return;
//     }
//     try {
//       await api.post(`/api/caretaker/log/${selectedPatient}`, { medicationId: selectedMedId, status: newStatus }, { withCredentials: true });
//       alert("Adherence logged.");
//       setError("");
//       fetchMedications(selectedPatient);
//     } catch (err) {
//       setError("Failed to log adherence");
//       console.error("Failed to log adherence:", err.response?.data || err);
//     }
//   };

//   // Start editing medication
//   const startEditingMed = (med) => {
//     setEditingMed(med._id);
//     setMedForm({
//       name: med.name || "",
//       dosage: med.dosage || "",
//       frequency: med.frequency || "",
//       startDate: med.startDate ? new Date(med.startDate).toISOString().slice(0, 10) : "",
//       endDate: med.endDate ? new Date(med.endDate).toISOString().slice(0, 10) : "",
//       reminders: med.reminders || [],
//     });
//   };

//   // Edit medication
//   const handleEditMed = async () => {
//     try {
//       await api.put(`/api/medication/${editingMed}`, medForm, { withCredentials: true });
//       alert("Medication updated!");
//       setEditingMed(null);
//       setMedForm({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
//       setError("");
//       fetchMedications(selectedPatient);
//     } catch (err) {
//       setError("Failed to update medication");
//       console.error("Failed to update medication:", err.response?.data || err);
//     }
//   };

//   // Delete medication
//   const deleteMed = async (medId) => {
//     if (!window.confirm("Are you sure you want to delete this medication?")) return;
//     try {
//       await api.delete(`/api/medication/${medId}`, { withCredentials: true });
//       alert("Medication deleted!");
//       setError("");
//       fetchMedications(selectedPatient);
//     } catch (err) {
//       setError("Failed to delete medication");
//       console.error("Failed to delete medication:", err.response?.data || err);
//     }
//   };

//   // Filter missed logs
//   const toggleMissedFilter = () => {
//     setFilterMissed(!filterMissed);
//     if (!filterMissed) {
//       setFilteredLogs(logs.filter(log => log.status === "missed"));
//     } else {
//       setFilteredLogs(logs);
//     }
//     setError("");
//   };

//   // Generate CSV manually
//   const downloadCSV = () => {
//     try {
//       const headers = ["Medication", "Status", "Date"];
//       const csvRows = [
//         headers.join(","),
//         ...logs.map(log =>
//           `"${log.medication?.name?.replace(/"/g, '""') || "Unknown"}","${log.status}","${new Date(log.takenAt).toLocaleString()}"`
//         ),
//       ];
//       const csv = csvRows.join("\n");
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       saveAs(blob, `adherence_report_${selectedPatient}.csv`);
//       setError("");
//     } catch (err) {
//       setError("Failed to generate CSV");
//       console.error("CSV generation failed:", err);
//     }
//   };

//   // Download PDF report using browser print
//   const downloadPDF = () => {
//     try {
//       const patient = patients.find(p => p._id === selectedPatient);
//       if (!patient) {
//         setError("Selected patient not found");
//         return;
//       }
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>Adherence Report</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             h1 { text-align: center; color: #333; }
//             .summary { margin: 20px 0; }
//             .logs { margin-top: 20px; }
//             .log-item { margin: 5px 0; padding: 10px; border-left: 3px solid #007bff; }
//             .taken { border-left-color: #28a745; }
//             .missed { border-left-color: #dc3545; }
//           </style>
//         </head>
//         <body>
//           <h1>Adherence Report for ${patient.name}</h1>
//           <div class="summary">
//             <p><strong>Total Logs:</strong> ${logs.length}</p>
//             <p><strong>Taken:</strong> ${logs.filter(log => log.status === "taken").length}</p>
//             <p><strong>Missed:</strong> ${logs.filter(log => log.status === "missed").length}</p>
//           </div>
//           <div class="logs">
//             <h2>Logs:</h2>
//             ${logs.map(log => `
//               <div class="log-item ${log.status}">
//                 <strong>${log.medication?.name || "Unknown"}:</strong> ${log.status} 
//                 <em>(${new Date(log.takenAt).toLocaleString()})</em>
//               </div>
//             `).join('')}
//           </div>
//         </body>
//         </html>
//       `;
//       const printWindow = window.open('', '_blank');
//       printWindow.document.open();
//       printWindow.document.write(htmlContent);
//       printWindow.document.close();
//       printWindow.onload = () => {
//         printWindow.print();
//         printWindow.close();
//       };
//       setError("");
//     } catch (err) {
//       setError("Failed to generate PDF");
//       console.error("PDF generation failed:", err);
//     }
//   };

//   // Push notification setup
//   const setupPushNotifications = async () => {
//     if (!("Notification" in window)) {
//       alert("This browser does not support notifications");
//       return;
//     }
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission === "granted") {
//         alert("Push notifications enabled (configure backend for full setup)!");
//         setError("");
//       }
//     } catch (err) {
//       setError("Failed to enable push notifications");
//       console.error("Push notification setup failed:", err);
//     }
//   };

//   // Logout function
//   const handleLogout = async () => {
//     try {
//       await api.post("/api/auth/logout", {}, { withCredentials: true });
//       alert("Logged out successfully!");
//       navigate("/login");
//     } catch (err) {
//       setError("Failed to logout");
//       console.error("Logout failed:", err.response?.data || err);
//     }
//   };

//   // Aggregate chart data
//   const getChartData = () => {
//     const data = {};
//     filteredLogs.forEach(log => {
//       const date = new Date(log.takenAt).toLocaleDateString();
//       if (!data[date]) {
//         data[date] = { name: date, taken: 0, missed: 0 };
//       }
//       if (log.status === "taken") {
//         data[date].taken += 1;
//       } else {
//         data[date].missed += 1;
//       }
//     });
//     return Object.values(data);
//   };

//   // Clear error after 5 seconds
//   useEffect(() => {
//     if (error) {
//       const timer = setTimeout(() => setError(""), 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [error]);

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   if (loading) return <div className="p-6 text-xl text-white">Loading dashboard...</div>;
//   if (error) return (
//     <div className="p-6 text-red-400">
//       {error}
//       <button
//         onClick={() => setError("")}
//         className="ml-4 bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
//       >
//         Clear Error
//       </button>
//     </div>
//   );

//   return (
//     <div className="p-4 sm:p-6 bg-gray-900 min-h-screen text-white">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl sm:text-3xl font-bold">Caretaker Dashboard</h1>
//         <button
//           onClick={handleLogout}
//           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//         >
//           Logout
//         </button>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Patients" value={summary.totalPatients} />
//         <StatCard title="Medications" value={summary.totalMedications} />
//       </div>
//       <h2 className="text-xl sm:text-2xl font-semibold mb-4">Assign/Unassign Patients</h2>
//       <div className="mb-6">
//         <button
//           onClick={() => setShowAssignForm(!showAssignForm)}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {showAssignForm ? "Cancel" : "Assign Patient"}
//         </button>
//         {showAssignForm && (
//           <div className="mt-4 bg-gray-800 p-4 rounded shadow">
//             <h3 className="text-lg font-semibold mb-2">Assign Existing Patient</h3>
//             <div className="flex flex-col gap-2">
//               <input
//                 type="email"
//                 value={patientForm.email}
//                 onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
//                 className="border rounded p-2 bg-gray-700 text-white"
//                 placeholder="Patient Email (e.g., patient@example.com)"
//               />
//               <input
//                 type="password"
//                 value={patientForm.password}
//                 onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
//                 className="border rounded p-2 bg-gray-700 text-white"
//                 placeholder="Patient Password"
//               />
//               <div className="flex gap-2">
//                 <button
//                   onClick={assignPatient}
//                   className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAssignForm(false);
//                     setError("");
//                   }}
//                   className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//       <h2 className="text-xl sm:text-2xl font-semibold mb-4">Assigned Patients</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//         {patients.map((p) => (
//           <div
//             key={p._id}
//             className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 cursor-pointer flex justify-between items-center"
//           >
//             <div onClick={() => fetchMedications(p._id)}>
//               <p className="font-semibold">{p.name}</p>
//               <p className="text-sm text-gray-400">Email: {p.email}</p>
//               <p className="text-sm text-gray-400">Contact: {p.contactNumber || "N/A"}</p>
//               <p className="text-sm text-gray-400">Age: {p.age || "N/A"}</p>
//             </div>
//             <button
//               onClick={() => unassignPatient(p._id)}
//               className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
//             >
//               Unassign
//             </button>
//           </div>
//         ))}
//       </div>
//       {selectedPatient && (
//         <>
//           <h2 className="text-xl sm:text-2xl font-semibold mb-4">Medications</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
//             {medications.map((med) => (
//               <div key={med._id} className="bg-gray-800 p-4 rounded shadow">
//                 {editingMed === med._id ? (
//                   <div className="flex flex-col gap-2">
//                     <input
//                       type="text"
//                       value={medForm.name}
//                       onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                       placeholder="Medication Name"
//                     />
//                     <input
//                       type="text"
//                       value={medForm.dosage}
//                       onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                       placeholder="Dosage"
//                     />
//                     <input
//                       type="text"
//                       value={medForm.frequency}
//                       onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                       placeholder="Frequency"
//                     />
//                     <input
//                       type="date"
//                       value={medForm.startDate}
//                       onChange={(e) => setMedForm({ ...medForm, startDate: e.target.value })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                     />
//                     <input
//                       type="date"
//                       value={medForm.endDate}
//                       onChange={(e) => setMedForm({ ...medForm, endDate: e.target.value })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                       placeholder="End Date (Optional)"
//                     />
//                     <input
//                       type="text"
//                       value={medForm.reminders.join(",")}
//                       onChange={(e) => setMedForm({ ...medForm, reminders: e.target.value.split(",").map(r => r.trim()).filter(r => r) })}
//                       className="border rounded p-2 bg-gray-700 text-white"
//                       placeholder="Reminders (e.g., 08:00,20:00)"
//                     />
//                     <div className="flex gap-2">
//                       <button
//                         onClick={handleEditMed}
//                         className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
//                       >
//                         Save
//                       </button>
//                       <button
//                         onClick={() => setEditingMed(null)}
//                         className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700"
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     <p><strong>{med.name}</strong></p>
//                     <p>Dosage: {med.dosage}</p>
//                     <p>Frequency: {med.frequency}</p>
//                     <p>Reminders: {med.reminders?.join(", ") || "None"}</p>
//                     <p>SMS Status: {smsStatus[med._id] || "Not sent"}</p>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       <button
//                         onClick={() => triggerReminder(med._id)}
//                         className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//                       >
//                         Send Reminder
//                       </button>
//                       <button
//                         onClick={() => startEditingMed(med)}
//                         className="bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => deleteMed(med._id)}
//                         className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="mb-6 bg-gray-800 p-4 rounded shadow">
//             <h3 className="text-xl font-semibold mb-2">Log Adherence</h3>
//             <div className="flex flex-col sm:flex-row gap-4 items-center">
//               <select
//                 className="border rounded p-2 bg-gray-700 text-white w-full sm:w-auto"
//                 value={selectedMedId}
//                 onChange={(e) => setSelectedMedId(e.target.value)}
//               >
//                 <option value="">Select Medication</option>
//                 {medications.map((med) => (
//                   <option key={med._id} value={med._id}>{med.name}</option>
//                 ))}
//               </select>
//               <select
//                 className="border rounded p-2 bg-gray-700 text-white w-full sm:w-auto"
//                 value={newStatus}
//                 onChange={(e) => setNewStatus(e.target.value)}
//               >
//                 <option value="taken">Taken</option>
//                 <option value="missed">Missed</option>
//               </select>
//               <button
//                 onClick={handleLogSubmit}
//                 className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//           <div className="mb-6 bg-gray-800 p-4 rounded shadow">
//             <h3 className="text-xl font-semibold mb-2">Adherence Logs</h3>
//             <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
//               <button
//                 onClick={toggleMissedFilter}
//                 className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//               >
//                 {filterMissed ? "Show All Logs" : "Show Missed Logs"}
//               </button>
//               <div className="flex gap-2">
//                 <button
//                   onClick={downloadCSV}
//                   className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
//                 >
//                   Download CSV
//                 </button>
//                 <button
//                   onClick={downloadPDF}
//                   className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
//                 >
//                   Download PDF
//                 </button>
//               </div>
//             </div>
//             {filteredLogs.length === 0 ? (
//               <p>No logs yet.</p>
//             ) : (
//               <ul>
//                 {filteredLogs.map((log) => (
//                   <li key={log._id} className="mb-2">
//                     <span className="font-medium">{log.medication?.name || "Unknown"}</span>:{" "}
//                     <span className={log.status === "taken" ? "text-green-400" : "text-red-400"}>{log.status}</span>
//                     {" "}({new Date(log.takenAt).toLocaleString()})
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           <div className="bg-gray-800 p-4 rounded shadow">
//             <h3 className="text-xl font-semibold mb-4">Weekly Adherence Chart</h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={getChartData()}>
//                 <XAxis dataKey="name" stroke="#ccc" />
//                 <YAxis allowDecimals={false} />
//                 <Tooltip />
//                 <CartesianGrid stroke="#444" strokeDasharray="3 3" />
//                 <Line type="monotone" dataKey="taken" stroke="#4ade80" strokeWidth={2} name="Taken" />
//                 <Line type="monotone" dataKey="missed" stroke="#f87171" strokeWidth={2} name="Missed" />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="mt-6">
//             <button
//               onClick={setupPushNotifications}
//               className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//             >
//               Enable Push Notifications
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // StatCard component to display summary statistics
// const StatCard = ({ title, value }) => (
//   <div className="bg-gray-800 shadow p-4 rounded text-center">
//     <p className="text-gray-400">{title}</p>
//     <p className="text-2xl font-bold text-white">{value || 0}</p>
//   </div>
// );

// export default CaretakerDashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { saveAs } from "file-saver";

const lightGradient = "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100";
const cardGlass = "bg-white/80 backdrop-blur-xl border border-purple-200 shadow-xl";
const cardAlt = "bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-xl border border-blue-200 shadow-lg";
const cardPink = "bg-gradient-to-r from-pink-50 to-rose-50 backdrop-blur-xl border border-pink-200 shadow-lg";
const cardTeal = "bg-gradient-to-r from-teal-50 to-cyan-50 backdrop-blur-xl border border-teal-200 shadow-lg";
const cardOrange = "bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-xl border border-orange-200 shadow-lg";
const sectionTitle = "text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent";
const buttonBase = "rounded-xl px-4 py-2 font-semibold shadow transition-all duration-300";
const buttonGrad = "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600";
const buttonDelete = "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600";
const buttonGreen = "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600";
const buttonGray = "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400";
const buttonBlue = "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600";
const buttonYellow = "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600";

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ totalPatients: 0, totalMedications: 0 });
  const [patients, setPatients] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [patientForm, setPatientForm] = useState({
    email: "",
    password: "",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [newStatus, setNewStatus] = useState("taken");
  const [selectedMedId, setSelectedMedId] = useState("");
  const [filterMissed, setFilterMissed] = useState(false);
  const [smsStatus, setSmsStatus] = useState({});
  const [editingMed, setEditingMed] = useState(null);
  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    reminders: [],
  });

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const { data } = await api.get("/api/caretaker/dashboard", { withCredentials: true });
      setSummary({
        totalPatients: data.totalPatients || 0,
        totalMedications: data.totalMedications || 0,
      });
      setPatients(data.patients || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error fetching dashboard:", err.response?.data || err);
    }
  };

  // Assign patient
  const assignPatient = async () => {
    const { email, password } = patientForm;
    if (!email || !password) {
      setError("Please provide both email and password");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    try {
      console.log("Verifying patient with email:", email);
      const verifyResponse = await api.post("/api/caretaker/verify-patient", { email, password }, { withCredentials: true });
      const patientId = verifyResponse.data.patientId;
      if (!patientId) {
        throw new Error("Patient ID not returned from verification");
      }
      console.log("Patient verified with ID:", patientId);
      await api.put(`/api/caretaker/assign/${patientId}`, {}, { withCredentials: true });
      alert("Patient assigned successfully!");
      setPatientForm({ email: "", password: "" });
      setShowAssignForm(false);
      setError("");
      fetchDashboard();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to verify or assign patient";
      console.error("Failed to verify or assign patient:", err.response?.data || err);
      setError(errorMessage);
    }
  };

  // Unassign patient
  const unassignPatient = async (patientId) => {
    try {
      await api.put(`/api/caretaker/unassign/${patientId}`, {}, { withCredentials: true });
      alert("Patient unassigned successfully!");
      setSelectedPatient(null);
      setMedications([]);
      setLogs([]);
      setFilteredLogs([]);
      setError("");
      fetchDashboard();
    } catch (err) {
      setError("Failed to unassign patient");
      console.error("Failed to unassign patient:", err.response?.data || err);
    }
  };

  // Fetch medications and logs
  const fetchMedications = async (patientId) => {
    try {
      setSelectedPatient(patientId);
      const { data } = await api.get(`/api/caretaker/patient/${patientId}/medications`, { withCredentials: true });
      setMedications(data.medications || []);
      const logsRes = await api.get(`/api/caretaker/report/${patientId}`, { withCredentials: true });
      setLogs(logsRes.data.logs || []);
      setFilteredLogs(logsRes.data.logs || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch medications or logs");
      console.error("Failed to fetch meds or logs:", err.response?.data || err);
    }
  };

  // Trigger SMS reminder
  const triggerReminder = async (medicationId) => {
    try {
      const response = await api.post("/api/caretaker/send-reminder", { patientId: selectedPatient, medicationId }, { withCredentials: true });
      setSmsStatus(prev => ({ ...prev, [medicationId]: response.data.smsStatus || "Delivered" }));
      alert("Reminder sent!");
      setError("");
    } catch (err) {
      setSmsStatus(prev => ({ ...prev, [medicationId]: "Failed" }));
      setError("Failed to send reminder");
      console.error("Failed to send reminder:", err.response?.data || err);
    }
  };

  // Log adherence
  const handleLogSubmit = async () => {
    if (!selectedMedId) {
      setError("Please select a medication");
      return;
    }
    try {
      await api.post(`/api/caretaker/log/${selectedPatient}`, { medicationId: selectedMedId, status: newStatus }, { withCredentials: true });
      alert("Adherence logged.");
      setError("");
      fetchMedications(selectedPatient);
    } catch (err) {
      setError("Failed to log adherence");
      console.error("Failed to log adherence:", err.response?.data || err);
    }
  };

  // Start editing medication
  const startEditingMed = (med) => {
    setEditingMed(med._id);
    setMedForm({
      name: med.name || "",
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      startDate: med.startDate ? new Date(med.startDate).toISOString().slice(0, 10) : "",
      endDate: med.endDate ? new Date(med.endDate).toISOString().slice(0, 10) : "",
      reminders: med.reminders || [],
    });
  };

  // Edit medication
  const handleEditMed = async () => {
    try {
      await api.put(`/api/medication/${editingMed}`, medForm, { withCredentials: true });
      alert("Medication updated!");
      setEditingMed(null);
      setMedForm({ name: "", dosage: "", frequency: "", startDate: "", endDate: "", reminders: [] });
      setError("");
      fetchMedications(selectedPatient);
    } catch (err) {
      setError("Failed to update medication");
      console.error("Failed to update medication:", err.response?.data || err);
    }
  };

  // Delete medication
  const deleteMed = async (medId) => {
    if (!window.confirm("Are you sure you want to delete this medication?")) return;
    try {
      await api.delete(`/api/medication/${medId}`, { withCredentials: true });
      alert("Medication deleted!");
      setError("");
      fetchMedications(selectedPatient);
    } catch (err) {
      setError("Failed to delete medication");
      console.error("Failed to delete medication:", err.response?.data || err);
    }
  };

  // Filter missed logs
  const toggleMissedFilter = () => {
    setFilterMissed(!filterMissed);
    if (!filterMissed) {
      setFilteredLogs(logs.filter(log => log.status === "missed"));
    } else {
      setFilteredLogs(logs);
    }
    setError("");
  };

  // Generate CSV manually
  const downloadCSV = () => {
    try {
      const headers = ["Medication", "Status", "Date"];
      const csvRows = [
        headers.join(","),
        ...logs.map(log =>
          `"${log.medication?.name?.replace(/"/g, '""') || "Unknown"}","${log.status}","${new Date(log.takenAt).toLocaleString()}"`
        ),
      ];
      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `adherence_report_${selectedPatient}.csv`);
      setError("");
    } catch (err) {
      setError("Failed to generate CSV");
      console.error("CSV generation failed:", err);
    }
  };

  // Download PDF report using browser print
  const downloadPDF = () => {
    try {
      const patient = patients.find(p => p._id === selectedPatient);
      if (!patient) {
        setError("Selected patient not found");
        return;
      }
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Adherence Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #333; }
            .summary { margin: 20px 0; }
            .logs { margin-top: 20px; }
            .log-item { margin: 5px 0; padding: 10px; border-left: 3px solid #007bff; }
            .taken { border-left-color: #28a745; }
            .missed { border-left-color: #dc3545; }
          </style>
        </head>
        <body>
          <h1>Adherence Report for ${patient.name}</h1>
          <div class="summary">
            <p><strong>Total Logs:</strong> ${logs.length}</p>
            <p><strong>Taken:</strong> ${logs.filter(log => log.status === "taken").length}</p>
            <p><strong>Missed:</strong> ${logs.filter(log => log.status === "missed").length}</p>
          </div>
          <div class="logs">
            <h2>Logs:</h2>
            ${logs.map(log => `
              <div class="log-item ${log.status}">
                <strong>${log.medication?.name || "Unknown"}:</strong> ${log.status} 
                <em>(${new Date(log.takenAt).toLocaleString()})</em>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      setError("");
    } catch (err) {
      setError("Failed to generate PDF");
      console.error("PDF generation failed:", err);
    }
  };

  // Push notification setup
  const setupPushNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        alert("Push notifications enabled (configure backend for full setup)!");
        setError("");
      }
    } catch (err) {
      setError("Failed to enable push notifications");
      console.error("Push notification setup failed:", err);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      alert("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      setError("Failed to logout");
      console.error("Logout failed:", err.response?.data || err);
    }
  };

  // Aggregate chart data
  const getChartData = () => {
    const data = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.takenAt).toLocaleDateString();
      if (!data[date]) {
        data[date] = { name: date, taken: 0, missed: 0 };
      }
      if (log.status === "taken") {
        data[date].taken += 1;
      } else {
        data[date].missed += 1;
      }
    });
    return Object.values(data);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <div className={`${lightGradient} min-h-screen flex items-center justify-center`}>
    <div className={`${cardGlass} p-8 rounded-2xl text-center`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-700 text-xl">Loading dashboard...</p>
    </div>
  </div>;

  if (error) return (
    <div className={`${lightGradient} min-h-screen flex items-center justify-center`}>
      <div className={`${cardPink} p-6 rounded-2xl max-w-md`}>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => setError("")}
          className={`${buttonBase} ${buttonGray}`}
        >
          Clear Error
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${lightGradient} min-h-screen p-0 sm:p-4 space-y-6 font-sans`}>
      {/* Navbar */}
      <nav className={`${cardGlass} flex flex-col sm:flex-row justify-between items-center p-4 rounded-2xl gap-4`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍⚕️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">AIMedicare - Caretaker</span>
        </div>
        <button onClick={handleLogout} className={`${buttonBase} ${buttonDelete}`}>Logout</button>
      </nav>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Patients" value={summary.totalPatients} color="purple" />
        <StatCard title="Total Medications" value={summary.totalMedications} color="pink" />
      </div>

      {/* Assign/Unassign Section */}
      <div className={`${cardAlt} p-6 rounded-2xl`}>
        <h2 className={`${sectionTitle} mb-4`}>Assign/Unassign Patients</h2>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className={`${buttonBase} ${buttonGrad}`}
        >
          {showAssignForm ? "Cancel" : "Assign Patient"}
        </button>
        {showAssignForm && (
          <div className="mt-4 p-4 bg-white/60 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Assign Existing Patient</h3>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                className="border border-blue-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-blue-300"
                placeholder="Patient Email (e.g., patient@example.com)"
              />
              <input
                type="password"
                value={patientForm.password}
                onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                className="border border-blue-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-blue-300"
                placeholder="Patient Password"
              />
              <div className="flex gap-2">
                <button onClick={assignPatient} className={`${buttonBase} ${buttonGreen}`}>Submit</button>
                <button
                  onClick={() => {
                    setShowAssignForm(false);
                    setError("");
                  }}
                  className={`${buttonBase} ${buttonGray}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Patients */}
      <div className={`${cardPink} p-6 rounded-2xl`}>
        <h2 className={`${sectionTitle} mb-4`}>Assigned Patients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {patients.map((p) => (
            <div
              key={p._id}
              className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl shadow-lg hover:shadow-xl cursor-pointer flex justify-between items-center border border-pink-200"
            >
              <div onClick={() => fetchMedications(p._id)} className="flex-1">
                <p className="font-semibold text-purple-600">{p.name}</p>
                <p className="text-sm text-gray-600">Email: {p.email}</p>
                <p className="text-sm text-gray-600">Contact: {p.contactNumber || "N/A"}</p>
                <p className="text-sm text-gray-600">Age: {p.age || "N/A"}</p>
              </div>
              <button
                onClick={() => unassignPatient(p._id)}
                className={`${buttonBase} ${buttonDelete} ml-2`}
              >
                Unassign
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Medications Section */}
          <div className={`${cardTeal} p-6 rounded-2xl`}>
            <h2 className={`${sectionTitle} mb-4`}>Medications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {medications.map((med) => (
                <div key={med._id} className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl shadow-lg border border-teal-200">
                  {editingMed === med._id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={medForm.name}
                        onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-teal-300"
                        placeholder="Medication Name"
                      />
                      <input
                        type="text"
                        value={medForm.dosage}
                        onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-teal-300"
                        placeholder="Dosage"
                      />
                      <input
                        type="text"
                        value={medForm.frequency}
                        onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-teal-300"
                        placeholder="Frequency"
                      />
                      <input
                        type="date"
                        value={medForm.startDate}
                        onChange={(e) => setMedForm({ ...medForm, startDate: e.target.value })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700"
                      />
                      <input
                        type="date"
                        value={medForm.endDate}
                        onChange={(e) => setMedForm({ ...medForm, endDate: e.target.value })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700"
                        placeholder="End Date (Optional)"
                      />
                      <input
                        type="text"
                        value={medForm.reminders.join(",")}
                        onChange={(e) => setMedForm({ ...medForm, reminders: e.target.value.split(",").map(r => r.trim()).filter(r => r) })}
                        className="border border-teal-200 rounded p-2 bg-white/60 text-gray-700 focus:ring-2 focus:ring-teal-300"
                        placeholder="Reminders (e.g., 08:00,20:00)"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEditMed} className={`${buttonBase} ${buttonGreen}`}>Save</button>
                        <button onClick={() => setEditingMed(null)} className={`${buttonBase} ${buttonGray}`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-teal-600">{med.name}</p>
                      <p className="text-gray-700">Dosage: {med.dosage}</p>
                      <p className="text-gray-700">Frequency: {med.frequency}</p>
                      <p className="text-gray-600">Reminders: {med.reminders?.join(", ") || "None"}</p>
                      <p className="text-gray-600">SMS Status: {smsStatus[med._id] || "Not sent"}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={() => triggerReminder(med._id)}
                          className={`${buttonBase} ${buttonBlue}`}
                        >
                          Send Reminder
                        </button>
                        <button
                          onClick={() => startEditingMed(med)}
                          className={`${buttonBase} ${buttonYellow}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMed(med._id)}
                          className={`${buttonBase} ${buttonDelete}`}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Log Adherence Section */}
          <div className={`${cardOrange} p-6 rounded-2xl`}>
            <h3 className={`${sectionTitle} mb-4`}>Log Adherence</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select
                className="border border-orange-200 rounded p-2 bg-white/60 text-gray-700 w-full sm:w-auto focus:ring-2 focus:ring-orange-300"
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
              >
                <option value="">Select Medication</option>
                {medications.map((med) => (
                  <option key={med._id} value={med._id}>{med.name}</option>
                ))}
              </select>
              <select
                className="border border-orange-200 rounded p-2 bg-white/60 text-gray-700 w-full sm:w-auto focus:ring-2 focus:ring-orange-300"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="taken">Taken</option>
                <option value="missed">Missed</option>
              </select>
              <button onClick={handleLogSubmit} className={`${buttonBase} ${buttonGreen}`}>Submit</button>
            </div>
          </div>

          {/* Adherence Logs Section */}
          <div className={`${cardGlass} p-6 rounded-2xl`}>
            <h3 className={`${sectionTitle} mb-4`}>Adherence Logs</h3>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <button onClick={toggleMissedFilter} className={`${buttonBase} ${buttonBlue}`}>
                {filterMissed ? "Show All Logs" : "Show Missed Logs"}
              </button>
              <div className="flex gap-2">
                <button onClick={downloadCSV} className={`${buttonBase} ${buttonGrad}`}>Download CSV</button>
                <button onClick={downloadPDF} className={`${buttonBase} ${buttonGrad}`}>Download PDF</button>
              </div>
            </div>
            {filteredLogs.length === 0 ? (
              <p className="text-gray-500">No logs yet.</p>
            ) : (
              <ul className="space-y-2">
                {filteredLogs.map((log) => (
                  <li key={log._id} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-3 rounded">
                    <span className="font-medium text-purple-600">{log.medication?.name || "Unknown"}</span>:{" "}
                    <span className={log.status === "taken" ? "text-green-500" : "text-pink-500"}>{log.status}</span>
                    {" "}({new Date(log.takenAt).toLocaleString()})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weekly Adherence Chart */}
          <div className={`${cardTeal} p-6 rounded-2xl`}>
            <h3 className={`${sectionTitle} mb-4`}>Weekly Adherence Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip />
                <CartesianGrid stroke="#e0e7ef" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="taken" stroke="#10b981" strokeWidth={2} name="Taken" />
                <Line type="monotone" dataKey="missed" stroke="#f87171" strokeWidth={2} name="Missed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Push Notifications */}
          <div className="pt-6">
            <button onClick={setupPushNotifications} className={`${buttonBase} ${buttonBlue}`}>
              Enable Push Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// StatCard component to display summary statistics
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    purple: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-600",
    pink: "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 text-pink-600",
    teal: "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 text-teal-600",
    orange: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-600"
  };

  return (
    <div className={`${colorClasses[color]} shadow-lg p-4 rounded-xl text-center border`}>
      <p className="text-gray-600 font-medium">{title}</p>
      <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  );
};

export default CaretakerDashboard;