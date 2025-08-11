const Medication = require("../models/Medication");
const Caretaker = require("../models/Caretaker");
const getPatientMedications = async (req, res) => {
  try {
    const userId = req.user.id;
    const medications = await Medication.find({ patient: userId });
    res.status(200).json({ success: true, medications }); // ✅ wrap in object
  } catch (error) {
    console.error("Error fetching patient medications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch medications" });
  }
};


const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const medication = await Medication.findById(id);
    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    const requesterId = req.user._id;
    const requesterRole = req.user.role;

    // If the user is a patient, they must be the owner of the medication
    if (requesterRole === "patient" && medication.patient.toString() !== requesterId.toString()) {
      return res.status(403).json({ message: "Unauthorized: Not your medication" });
    }

    // If the user is a caretaker, they must be assigned to the patient
    if (requesterRole === "caretaker") {
      const caretaker = await Caretaker.findById(requesterId);
      if (!caretaker.assignedPatients.includes(medication.patient.toString())) {
        return res.status(403).json({ message: "Caretaker not linked to this patient" });
      }
    }

    // Proceed with update
    const updated = await Medication.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Server error while updating medication" });
  }
};

module.exports = { getPatientMedications, updateMedication };