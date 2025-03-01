import express from 'express';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import schedule from 'node-schedule';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://testfcm-6cb6f.firebaseio.com'
});

const db = admin.database();

// Schedule notification
app.post('/schedule-notification', (req, res) => {
  const { token, scheduledTime } = req.body;
  
  const job = schedule.scheduleJob(new Date(scheduledTime), function() {
    const message = {
      notification: {
        title: 'Golden Notification',
        body: "Let's gooooooooooooooooo"
      },
      token: token
    };

    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  });

  // Store the scheduled job in Firebase Realtime Database
  const jobRef = db.ref('scheduled_notifications').push();
  jobRef.set({
    token: token,
    scheduledTime: scheduledTime,
    jobId: job.name
  });

  res.json({ success: true, message: 'Notification scheduled' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});