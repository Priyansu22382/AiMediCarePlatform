// testRoute.js (inside routes/)
const express = require("express");
const router = express.Router();
const sendSMS = require("../utils/sendSMS");

router.post("/test-sms", async (req, res) => {
  const { to, body } = req.body;
  try {
    await sendSMS(to, body);
    res.status(200).json({ message: "SMS sent successfully!" });
  } catch (error) {
    console.error("SMS send error:", error.message);
    res.status(500).json({ message: "Failed to send SMS" });
  }
});

// In routes/test.js or any custom route

router.get('/send-sms', async (req, res) => {
  try {
    await sendSMS('+11234567890', 'Test message from frontend');
    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'SMS failed', error: error.message });
  }
});

module.exports = router;

