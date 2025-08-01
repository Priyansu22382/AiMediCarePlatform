
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
        backgroundColor: "#22c55e"
      },
      {
        label: "Missed",
        data: medications.map(m => logs.filter(l => l.medication?._id === m._id && l.status === "missed").length),
        backgroundColor: "#ef4444"
      }
    ]
  };

  if (loading) return <p className="text-white text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-6 py-10 space-y-10">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-[#1e293b] p-4 rounded-2xl shadow-xl">
        <div className="text-2xl font-bold tracking-tight">🧠 AIMedicare</div>
        <div className="flex gap-4 text-sm">
          <button onClick={toggleForm} className="hover:text-blue-400 transition">Add Medication</button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="hover:text-red-400 transition">Logout</button>
        </div>
      </nav>

      {/* Patient Info */}
      <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome, {patient?.name}</h2>
        <div className="text-sm space-y-1">
          <p><span className="text-gray-400">Email:</span> {patient?.email}</p>
          <p><span className="text-gray-400">Phone:</span> {patient?.contactNumber}</p>
        </div>
        {patient?.caretaker && (
          <div className="mt-4 text-sm">
            <h3 className="text-md font-semibold">Caretaker</h3>
            <p><span className="text-gray-400">Name:</span> {patient.caretaker.name}</p>
            <p><span className="text-gray-400">Email:</span> {patient.caretaker.email}</p>
            <p><span className="text-gray-400">Phone:</span> {patient.caretaker.contactNumber}</p>
          </div>
        )}
      </section>

      {/* Form */}
      {showForm && (
        <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-lg font-semibold">Add Medication</h3>
          <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-3">
            {["name", "dosage", "frequency"].map((field) => (
              <input key={field} className="bg-[#334155] p-2 rounded-xl" placeholder={field} value={newMed[field]} onChange={e => setNewMed({ ...newMed, [field]: e.target.value })} />
            ))}
            <input type="date" className="bg-[#334155] p-2 rounded-xl" value={newMed.startDate} onChange={e => setNewMed({ ...newMed, startDate: e.target.value })} />
            <input type="date" className="bg-[#334155] p-2 rounded-xl" value={newMed.endDate} onChange={e => setNewMed({ ...newMed, endDate: e.target.value })} />
            <div className="col-span-full space-y-2">
              <label className="text-gray-400 text-sm">Reminder Times (HH:mm)</label>
              <div className="flex flex-wrap gap-2">
                {newMed.reminders.map((time, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <input type="time" className="bg-[#334155] p-2 rounded-xl" value={time} onChange={e => { const updated = [...newMed.reminders]; updated[index] = e.target.value; setNewMed({ ...newMed, reminders: updated }); }} />
                    <button className="text-red-400" onClick={() => setNewMed({ ...newMed, reminders: newMed.reminders.filter((_, i) => i !== index) })}>&times;</button>
                  </div>
                ))}
                <button onClick={() => setNewMed({ ...newMed, reminders: [...newMed.reminders, ""] })} className="text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded-xl">+ Add Time</button>
              </div>
            </div>
            <button onClick={handleAddMed} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl col-span-full">Submit</button>
          </div>
        </section>
      )}

      {/* Chart */}
      <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-semibold mb-4">📊 Adherence Trend</h3>
        <Bar data={adherenceChartData} />
      </section>

      {/* Medications */}
      <section className="space-y-4">
        {medications.map((med) => (
          <div key={med._id} className="bg-[#1e293b] p-4 rounded-2xl shadow-md">
            <h4 className="text-lg font-semibold">💊 {med.name}</h4>
            <p className="text-sm text-gray-300">Dosage: {med.dosage}</p>
            <p className="text-sm text-gray-300">Frequency: {med.frequency}</p>
            <p className="text-sm text-gray-300">Start: {new Date(med.startDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-300">End: {new Date(med.endDate).toLocaleDateString()}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleAdherence(med._id, "taken")} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Taken</button>
              <button onClick={() => handleAdherence(med._id, "missed")} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Missed</button>
              <button onClick={() => handleDelete(med._id)} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* Logs */}
      <section className="bg-[#1e293b] p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-semibold mb-4">🗂 Adherence Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No logs available.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map(log => (
              <li key={log._id} className="bg-[#334155] p-3 rounded-xl">
                <p>Medication: {log.medication?.name}</p>
                <p>Status: {log.status}</p>
                <p>Date: {new Date().toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SMS */}
      <section className="text-center">
        <button onClick={handleTwilioTest} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl">Send Test SMS</button>
        {patient?.contactNumber && <p className="text-sm text-gray-400 mt-2">Sending to: {patient.contactNumber}</p>}
      </section>
    </div>
  );
};

export default PatientDashboard;

