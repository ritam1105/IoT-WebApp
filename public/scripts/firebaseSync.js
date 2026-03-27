require('dotenv').config();
const admin = require('firebase-admin');
const SensorData = require('../models/SensorData');

// Init Firebase only once
if (!admin.apps.length) {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FireBase_URL
    });
}

const db = admin.database();
let isFetching = false;
let intervalId = null;
let currentSessionId = null;
let currentUserId = null;

async function fetchAndStore() {
    try {
        const snapshot = await db.ref('/sensor').once('value');
        const data = snapshot.val();
        if (!data) return;

        const record = new SensorData({
            userId:      currentUserId,
            sessionId:   currentSessionId,
            temperature: data.temperature,
            pH:          data.pH,
            waterLevel:  data.waterLevel,
            turbidity:   data.turbidity
        });

        await record.save();
        console.log('Saved:', record.temperature, record.pH, record.waterLevel, record.turbidity);
    } catch (err) {
        console.error('Sync error:', err.message);
    }
}

function startFetching(userId, sessionId) {
    if (isFetching) return;
    currentUserId   = userId;
    currentSessionId = sessionId;
    isFetching = true;
    fetchAndStore(); // immediate first fetch
    intervalId = setInterval(fetchAndStore, 5000);
    console.log('Fetching started — session:', sessionId);
}

function stopFetching() {
    if (!isFetching) return;
    clearInterval(intervalId);
    isFetching = false;
    intervalId = null;
    console.log('Fetching stopped');
}

function getStatus()        { return isFetching; }
function getCurrentSession() { return currentSessionId; }

module.exports = { startFetching, stopFetching, getStatus, getCurrentSession };
