// const cron = require("node-cron");
// const twilio = require("twilio");
// const Medication = require("../models/Medication");
// const Adherence = require("../models/AdherenceLog");
// const dotenv = require("dotenv");
// dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const scheduledTasks = new Set();

// const scheduleReminders = async () => {
//   const medications = await Medication.find().populate("patient");
//   console.log("⏰ Scheduling medication reminders...");


//   medications.forEach((med, medIndex) => {
//     console.log(`🩺 Medication: ${med.name}, Dosage: ${med.dosage}, Patient: ${med.patient.name}, Reminders: ${med.reminders.join(", ")}`);

//     med.reminders.forEach((time) => {
//       const [hourStr, minuteStr] = time.split(":");
//       let hour = parseInt(hourStr);
//       let minute = parseInt(minuteStr);

//       const reminderOffsets = [15, 10, 5, 0];

//       reminderOffsets.forEach((offset) => {
//         let remHour = hour;
//         let remMinute = minute - offset;

//         if (remMinute < 0) {
//           remMinute += 60;
//           remHour -= 1;
//         }
//         if (remHour < 0) remHour += 24;

//         const cronTime = `${remMinute} ${remHour} * * *`;
//         const taskId = `${med._id}-${offset}-reminder`;

//         if (!scheduledTasks.has(taskId)) {
//           scheduledTasks.add(taskId);

//           cron.schedule(cronTime, async () => {
//             console.log(`Scheduled cron for ${med.name} at ${cronTime}`);

//             const phone = med.patient.contactNumber;
//             if (!phone) return;

//             const message = offset === 0
//               ? `Hi ${med.patient.name}, it's time to take your medication (${med.name} - ${med.dosage}) now.`
//               : `Hi ${med.patient.name}, your medication (${med.name} - ${med.dosage}) is in ${offset} minutes.`;

//             const delay = medIndex * 1500; // 1.5s per medication to space out requests

//             setTimeout(async () => {
//               try {
//                 await client.messages.create({
//                   body: message,
//                   from: process.env.TWILIO_PHONE_NUMBER,
//                   to: `+91${phone}`,
//                 });

//                 // Add delay between SMS and Call
//                 setTimeout(async () => {
//                   await client.calls.create({
//                     twiml: `<Response><Say>${message}</Say></Response>`,
//                     from: process.env.TWILIO_PHONE_NUMBER,
//                     to: `+91${phone}`,
//                   });

//                   console.log(`[${new Date().toISOString()}] 📞 SMS & Call sent to ${phone} (${offset} mins before)`);
//                 }, 1000); // 1 second delay between SMS and call

//               } catch (err) {
//                 console.error("Reminder Error (SMS or Call):", err.message);
//               }
//             }, delay);
//           });
//         }
//       });

//       // Post-check (5 mins after)
//       let postHour = hour;
//       let postMinute = minute + 5;
//       if (postMinute >= 60) {
//         postMinute -= 60;
//         postHour += 1;
//       }
//       if (postHour >= 24) postHour = 0;

//       const postCronTime = `${postMinute} ${postHour} * * *`;
//       const postTaskId = `${med._id}-post-check`;

//       if (!scheduledTasks.has(postTaskId)) {
//         scheduledTasks.add(postTaskId);

//         cron.schedule(postCronTime, async () => {
//           const now = new Date();
//           console.log(`📊 Checking adherence for ${med.name} (${med.dosage}) at ${time} for patient ${med.patient.name}`);

//           const startOfDay = new Date(now.setHours(0, 0, 0, 0));
//           const endOfDay = new Date(now.setHours(23, 59, 59, 999));

//           const adherenceRecord = await Adherence.findOne({
//             patient: med.patient._id,
//             medication: med._id,
//             takenAt: { $gte: startOfDay, $lte: endOfDay },
//           });

//           const phone = med.patient.contactNumber;
//           if (!phone) return;

//           let statusMessage = `Hi ${med.patient.name}, `;
//           if (!adherenceRecord) {
//             statusMessage += `you missed your medication (${med.name} - ${med.dosage}) scheduled at ${time}.`;
//           } else if (adherenceRecord.status === "taken") {
//             statusMessage += `you took your medication (${med.name}) on time. Great job!`;
//           } else {
//             statusMessage += `you haven't marked your medication (${med.name}) as taken.`;
//           }

//           const delay = medIndex * 1200;

//           setTimeout(async () => {
//             try {
//               await client.messages.create({
//                 body: statusMessage,
//                 from: process.env.TWILIO_PHONE_NUMBER,
//                 to: `+91${phone}`,
//               });

//               console.log(`[${new Date().toISOString()}] ✅ Post-check SMS sent to ${phone}`);
//             } catch (err) {
//               console.error("Post-check SMS error:", err.message);
//             }
//           }, delay);
//         });
//       }
//     });
//   });
// };

// module.exports = scheduleReminders;


const cron = require("node-cron");
const twilio = require("twilio");
const Medication = require("../models/Medication");
const Adherence = require("../models/AdherenceLog");
const dotenv = require("dotenv");
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const scheduledTasks = new Set();
const scheduleReminders = async () => {
  const medications = await Medication.find().populate("patient");
  console.log("⏰ Scheduling medication reminders...");

  const groupedReminders = {}; // { "patientId_time": [med1, med2, ...] }

  // Group medications by patient and reminder time
  medications.forEach((med) => {
    med.reminders.forEach((time) => {
      const key = `${med.patient._id}_${time}`;
      if (!groupedReminders[key]) groupedReminders[key] = [];
      groupedReminders[key].push(med);
    });
  });

  // Loop over grouped keys
  for (const key in groupedReminders) {
    const [patientId, time] = key.split("_");
    const meds = groupedReminders[key];
    const patient = meds[0].patient;
    const phone = patient.contactNumber;

    if (!phone) continue;

    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr);
    let minute = parseInt(minuteStr);

    const reminderOffsets = [15, 10, 5, 0];

    reminderOffsets.forEach((offset) => {
      let remHour = hour;
      let remMinute = minute - offset;

      if (remMinute < 0) {
        remMinute += 60;
        remHour -= 1;
      }
      if (remHour < 0) remHour += 24;

      const cronTime = `${remMinute} ${remHour} * * *`;
      const taskId = `${patientId}-${time}-${offset}`;

      if (!scheduledTasks.has(taskId)) {
        scheduledTasks.add(taskId);

        cron.schedule(cronTime, async () => {
          const medList = meds.map((med) => `${med.name} (${med.dosage})`).join(", ");
          const message =
            offset === 0
              ? `Hi ${patient.name}, it's time to take your medications: ${medList}.`
              : `Hi ${patient.name}, your medications (${medList}) are due in ${offset} minutes.`;

          try {
            await client.messages.create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: `+91${phone}`,
            });

            setTimeout(async () => {
              await client.calls.create({
                twiml: `<Response><Say>${message}</Say></Response>`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+91${phone}`,
              });

              console.log(`[${new Date().toISOString()}] 📞 SMS & Call sent to ${phone} (${offset} mins before)`);
            }, 1000);
          } catch (err) {
            console.error("Reminder Error (SMS/Call):", err.message);
          }
        });
      }
    });

    // Post-check (5 mins after original time)
    let postHour = hour;
    let postMinute = minute + 5;
    if (postMinute >= 60) {
      postMinute -= 60;
      postHour += 1;
    }
    if (postHour >= 24) postHour = 0;

    const postCronTime = `${postMinute} ${postHour} * * *`;
    const postTaskId = `${patientId}-${time}-post`;

    if (!scheduledTasks.has(postTaskId)) {
      scheduledTasks.add(postTaskId);

      cron.schedule(postCronTime, async () => {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        let missedMeds = [];

        for (const med of meds) {
          const adherenceRecord = await Adherence.findOne({
            patient: patient._id,
            medication: med._id,
            takenAt: { $gte: startOfDay, $lte: endOfDay },
          });

          if (!adherenceRecord || adherenceRecord.status !== "taken") {
            missedMeds.push(`${med.name} (${med.dosage})`);
          }
        }

        let postMessage = `Hi ${patient.name}, `;
        if (missedMeds.length === 0) {
          postMessage += `you took all your medications scheduled at ${time}. Great job!`;
        } else {
          postMessage += `you missed the following medications scheduled at ${time}: ${missedMeds.join(", ")}.`;
        }

        try {
          await client.messages.create({
            body: postMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`,
          });

          console.log(`[${new Date().toISOString()}] ✅ Post-check SMS sent to ${phone}`);
        } catch (err) {
          console.error("Post-check SMS error:", err.message);
        }
      });
    }
  }
};

module.exports = scheduleReminders;


