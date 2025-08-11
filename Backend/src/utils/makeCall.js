// const twilio = require("twilio");
// const dotenv = require("dotenv");
// dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// const makeCall = async (to, message) => {
//   try {
//     await client.calls.create({
//       twiml: `<Response><Say>${message}</Say></Response>`,
//       to: to,
//       from: process.env.TWILIO_PHONE_NUMBER,
//     });
//   } catch (error) {
//     console.error("Voice call error:", error.message);
//     throw error;
//   }
// };

// module.exports = makeCall;


const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VoiceResponse = twilio.twiml.VoiceResponse;

const makeCall = async (to, message) => {
  try {
    const response = new VoiceResponse();
    response.say({ voice: 'alice', language: 'en-IN' }, message);
    await client.calls.create({
      twiml: response.toString(), // Properly formatted TwiML XML
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
  } catch (error) {
    console.error("Voice call error:", error.message);
    throw error;
  }
};

module.exports = makeCall;