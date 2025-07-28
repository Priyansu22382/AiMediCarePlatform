const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlewares");
const { isCaretaker } = require("../middlewares/roleBasedMiddleware");
const User = require("../models/User");
const Medication = require("../models/Medication");
const Caretaker = require("../models/Caretaker");
const mongoose = require("mongoose");
const AdherenceLog = require("../models/AdherenceLog");
const Patient = require("../models/Patient");
const makeCall = require("../utils/makeCall");
const sendSMS = require("../utils/sendSMS");
const bcrypt = require("bcryptjs");
// Get assigned patients
// Description: Gets all patients assigned to the caretaker.
// Access: Protected route — Only caretakers
router.get("/patients", authMiddleware, isCaretaker, async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id).populate("assignedPatients");
    res.json({ patients: caretaker.assignedPatients });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch patients", error: err.message });
  }
});

// Get medications for a specific patient
router.get("/patient/:id/medications", authMiddleware, isCaretaker, async (req, res) => {
  try {
    // Validate patientId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    // Check if the patient is assigned to the caretaker
    const caretaker = await Caretaker.findById(req.user._id).populate("assignedPatients");
    if (!caretaker.assignedPatients.some(p => p._id.toString() === req.params.id)) {
      return res.status(403).json({ message: "Unauthorized access to patient medications" });
    }

    const meds = await Medication.find({ patient: req.params.id })
      .populate("patient", "name email contactNumber age")
      .lean();

    if (!meds.length) {
      return res.status(404).json({ message: "No medications found for this patient" });
    }

    res.json({ medications: meds });
  } catch (err) {
    console.error("Error fetching medications:", err);
    res.status(500).json({ message: "Error fetching medications", error: err.message });
  }
});
// Assign patient
router.put("/assign/:patientId", authMiddleware, isCaretaker, async (req, res) => {
  try {
    await Caretaker.findByIdAndUpdate(req.user._id, {
      $addToSet: { assignedPatients: req.params.patientId }
    });
    await Patient.findByIdAndUpdate(req.params.patientId, {
      caretaker: req.user._id
    });
    res.json({ message: "Patient assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
});

// Unassign patient
router.put("/unassign/:patientId", authMiddleware, isCaretaker, async (req, res) => {
  try {
    // Remove the patient from the caretaker's assignedPatients
    await Caretaker.findByIdAndUpdate(req.user._id, {
      $pull: { assignedPatients: req.params.patientId }
    });

    // Set caretaker field to null in the Patient model
    await Patient.findByIdAndUpdate(req.params.patientId, {
      $unset: { caretaker: "" }
    });

    res.json({ message: "Patient unassigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Unassignment failed", error: err.message });
  }
});


router.get("/dashboard", authMiddleware, isCaretaker, async (req, res) => {
  try {
    const caretaker = await Caretaker.findById(req.user._id).populate("assignedPatients");

    const patients = caretaker.assignedPatients;
    const medications = [];

    for (let patient of patients) {
      const meds = await Medication.find({ patient: patient._id }).lean();
      meds.forEach(med => {
        medications.push({
          ...med,
          patientName: patient.name
        });
      });
    }

    res.json({
      totalPatients: patients.length,
      totalMedications: medications.length,
      patients,
      medications,
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard failed", error: err.message });
  }
});

router.post("/send-reminder", authMiddleware, isCaretaker, async (req, res) => {
  const { patientId, medicationId } = req.body;

  try {
    const patient = await User.findById(patientId);
    const medication = await Medication.findById(medicationId);

    if (!patient || !medication)
      return res.status(404).json({ message: "Patient or medication not found" });

    await sendSMS(
      `+91${patient.contactNumber}`,
      `Hi ${patient.name}, reminder: Take your medication - ${medication.name} (${medication.dosage})`
    );

    await makeCall(`+91${patient.contactNumber}`, `Hi ${patient.name}, reminder: Take your medication - ${medication.name} ${medication.dosage}`);

    res.json({ message: "Reminder sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send reminder", error: err.message });
  }
});

router.get("/report/:patientId", authMiddleware, isCaretaker, async (req, res) => {
  try {
    const logs = await AdherenceLog.find({ patient: req.params.patientId })
      .populate("medication");

    const taken = logs.filter(log => log.status === "taken");
    const missed = logs.filter(log => log.status === "missed");

    res.status(200).json({
      totalLogs: logs.length,
      takenCount: taken.length,
      missedCount: missed.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch report", error: err.message });
  }
});

router.post("/log/:patientId", authMiddleware, isCaretaker, async (req, res) => {
  const { medicationId, status } = req.body;

  try {
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(req.params.patientId) || !mongoose.Types.ObjectId.isValid(medicationId)) {
      return res.status(400).json({ message: "Invalid patient or medication ID" });
    }
    if (!["taken", "missed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Check if the patient is assigned to the caretaker
    const caretaker = await Caretaker.findById(req.user._id).populate("assignedPatients");
    if (!caretaker.assignedPatients.some(p => p._id.toString() === req.params.patientId)) {
      return res.status(403).json({ message: "Unauthorized access to patient" });
    }

    // Verify medication belongs to the patient
    const medication = await Medication.findOne({ _id: medicationId, patient: req.params.patientId });
    if (!medication) {
      return res.status(404).json({ message: "Medication not found for this patient" });
    }

    const log = await AdherenceLog.create({
      medication: medicationId,
      patient: req.params.patientId,
      status
    });

    res.status(201).json({ message: "Adherence logged by caretaker", log });
  } catch (error) {
    console.error("Error logging adherence:", error);
    res.status(500).json({ message: "Logging failed", error: error.message });
  }
});


router.post("/verify-patient", authMiddleware, isCaretaker, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const patient = await User.findOne({ email });
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient does not exist" });
    }

    // compare hashed password
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.json({ message: "Patient verified successfully", patientId: patient._id });
  } catch (err) {
    console.error("Error verifying patient:", err);
    res.status(500).json({ message: "Failed to verify patient", error: err.message });
  }
});

module.exports = router;
