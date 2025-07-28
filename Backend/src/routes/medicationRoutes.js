const express = require("express");
const router = express.Router();
const Medication = require("../models/Medication");
const Patient = require("../models/Patient");
const authMiddleware = require("../middlewares/authMiddlewares");
const { isPatientOrCaretaker } = require("../middlewares/roleBasedMiddleware");
const { getPatientMedications, updateMedication } = require("../controllers/medicationController");


// ➕ Add a new medication
router.post("/add", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  const { name, dosage, frequency, startDate, endDate, reminders } = req.body;

  try {
    const newMed = await Medication.create({
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      reminders,
      patient: req.user._id
    });

    // 🔁 Update the patient's medications array
    await Patient.findByIdAndUpdate(req.user._id, {
      $push: { medications: newMed._id }
    });

    res.status(201).json({ message: "Medication added", medication: newMed });
  } catch (error) {
    res.status(500).json({ message: "Failed to add medication", error: error.message });
  }
});

// 📥 Get all medications for the logged-in patient
router.get("/my", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  try {
    const meds = await Medication.find({ patient: req.user._id });
    res.status(200).json({ medications: meds });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch medications", error: error.message });
  }
});

// 🗑️ Delete a medication
// router.delete("/:id", authMiddleware, isPatientOrCaretaker, async (req, res) => {
//   try {
//     // Find and delete the medication
//     const med = await Medication.findOneAndDelete({
//       _id: req.params.id,
//       patient: req.user._id
//     });

//     if (!med) {
//       return res.status(404).json({ message: "Medication not found" });
//     }

//     // Remove medication reference from patient's (user's) medications array
//     await Patient.findByIdAndUpdate(req.user._id, {
//       $pull: { medications: med._id }
//     });

//     res.status(200).json({ message: "Medication deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to delete medication", error: error.message });
//   }
// });

router.delete("/:id", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  try {
    // Find and delete the medication
    const med = await Medication.findById(req.params.id);
    

    if (!med) {
      return res.status(404).json({ message: "Medication not found" });
    }

    // Remove medication reference from patient's (user's) medications array

    await Medication.findByIdAndDelete(req.params.id);
    await Patient.findByIdAndUpdate(req.user._id, {
      $pull: { medications: med._id }
    });

    res.status(200).json({ message: "Medication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete medication", error: error.message });
  }
});
// ✏️ Update a medication
router.put("/:id", authMiddleware, updateMedication);

router.get("/get-patient-medications", authMiddleware, isPatientOrCaretaker, getPatientMedications);
module.exports = router;
