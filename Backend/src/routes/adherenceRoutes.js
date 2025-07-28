const express = require("express");
const router = express.Router();
const AdherenceLog = require("../models/AdherenceLog");
const authMiddleware = require("../middlewares/authMiddlewares");
const { isPatientOrCaretaker } = require("../middlewares/roleBasedMiddleware");

// ✅ 1. Log adherence
router.post("/log", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  const { medicationId, status } = req.body;

  try {
    const log = await AdherenceLog.create({
      medication: medicationId,
      patient: req.user._id,
      status,
    });

    res.status(201).json({ message: "Adherence logged", log });
  } catch (error) {
    res.status(500).json({ message: "Error logging adherence", error: error.message });
  }
});

// 📥 2. Get all adherence logs for logged-in patient
router.get("/my", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  try {
    const logs = await AdherenceLog.find({ patient: req.user._id }).populate("medication");
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch adherence logs", error: error.message });
  }
});

// 📥 3. Get logs for a specific medication
router.get("/medication/:id", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  try {
    const logs = await AdherenceLog.find({
      patient: req.user._id,
      medication: req.params.id,
    });
    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
});

// 🗑️ 4. Delete a specific adherence log (optional)
router.delete("/:id", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  try {
    const log = await AdherenceLog.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.status(200).json({ message: "Adherence log deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete log", error: error.message });
  }
});

// ✏️ 5. Update adherence log status (optional)
router.put("/:id", authMiddleware, isPatientOrCaretaker, async (req, res) => {
  const { status } = req.body;

  try {
    const log = await AdherenceLog.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status },
      { new: true }
    );

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.status(200).json({ message: "Log updated", log });
  } catch (error) {
    res.status(500).json({ message: "Failed to update log", error: error.message });
  }
});

module.exports = router;
