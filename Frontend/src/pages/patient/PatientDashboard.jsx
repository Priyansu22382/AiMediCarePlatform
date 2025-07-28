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

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center bg-gray-800 p-4 rounded shadow">
        <div className="text-xl font-bold">AIMedicare - Patient</div>
        <div className="flex gap-4">
          <button onClick={toggleForm} className="hover:text-blue-400">Add Medication</button>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="hover:text-red-400">Logout</button>
        </div>
      </nav>

      {/* Welcome Info */}
      {/* Welcome Info */}
<div className="bg-gray-800 p-6 rounded shadow">
  <h2 className="text-2xl font-bold">Welcome, {patient?.name}</h2>
  <p><strong>Email:</strong> {patient?.email}</p>
  <p><strong>Phone:</strong> {patient?.contactNumber}</p>

  {/* 🧠 Add Caretaker Info */}
  <div className="mt-4">
    <h3 className="text-lg font-semibold">Your Caretaker</h3>
    {patient?.caretaker ? (
      <div className="space-y-1">
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
        <div className="bg-gray-800 p-6 rounded shadow">
          <h3 className="text-xl mb-4">Add Medication</h3>
          <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-2">
  {['name', 'dosage', 'frequency'].map(field => (
    <input
      key={field}
      className="bg-gray-700 text-white p-2 rounded"
      placeholder={field}
      value={newMed[field]}
      onChange={e => setNewMed({ ...newMed, [field]: e.target.value })}
    />
  ))}
  <input
    type="date"
    className="bg-gray-700 text-white p-2 rounded"
    value={newMed.startDate}
    onChange={e => setNewMed({ ...newMed, startDate: e.target.value })}
  />
  <input
    type="date"
    className="bg-gray-700 text-white p-2 rounded"
    value={newMed.endDate}
    onChange={e => setNewMed({ ...newMed, endDate: e.target.value })}
  />

  {/* Reminder Time Inputs */}
  <div className="col-span-full">
    <label className="block text-sm text-gray-400 mb-1">Reminder Times (HH:mm)</label>
    <div className="flex flex-wrap gap-2">
      {newMed.reminders.map((time, index) => (
        <div key={index} className="flex items-center gap-1">
          <input
            type="time"
            className="bg-gray-700 text-white p-2 rounded"
            value={time}
            onChange={(e) => {
              const updated = [...newMed.reminders];
              updated[index] = e.target.value;
              setNewMed({ ...newMed, reminders: updated });
            }}
          />
          <button
            className="text-red-400 hover:text-red-600"
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
        className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
      >
        + Add Time
      </button>
    </div>
  </div>

  <button
    onClick={handleAddMed}
    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded col-span-full"
  >
    Submit
  </button>
</div>

        </div>
      )}

      {/* Adherence Chart */}
      <div className="bg-gray-800 p-6 rounded shadow">
        <h3 className="text-xl mb-4">Adherence Trend</h3>
        <Bar data={adherenceChartData} />
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {medications.map(med => (
          <div key={med._id} className="bg-gray-800 p-4 rounded shadow">
            <h4 className="text-lg font-semibold">{med.name}</h4>
            <p>Dosage: {med.dosage}</p>
            <p>Frequency: {med.frequency}</p>
            <p>Start: {new Date(med.startDate).toLocaleDateString()}</p>
            <p>End: {new Date(med.endDate).toLocaleDateString()}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleAdherence(med._id, "taken")} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded">Taken</button>
              <button onClick={() => handleAdherence(med._id, "missed")} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded">Missed</button>
              <button onClick={() => handleDelete(med._id)} className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Adherence Logs */}
      <div className="bg-gray-800 p-6 rounded shadow">
        <h3 className="text-xl mb-4">Adherence Logs</h3>
        {logs.length === 0 ? (
          <p className="text-gray-400">No logs available.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log._id} className="bg-gray-700 p-3 rounded">
                <p>{log.medication?.name}</p>
                <p>Status: {log.status}</p>
                <p>{new Date().toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Twilio Test */}
      <div className="pt-6">
        <button onClick={handleTwilioTest} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Send Test SMS</button>
        {patient?.contactNumber && <p className="text-sm text-gray-400 mt-2">SMS will be sent to: {patient.contactNumber}</p>}
      </div>
    </div>
  );
};

export default PatientDashboard;
