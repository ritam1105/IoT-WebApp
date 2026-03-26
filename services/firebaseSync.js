const admin = require('firebase-admin');
const SensorData = require('../models/sensorData');
const serviceAccount = require('../serviceAccountKey.json');

// Init Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FireBase_URL
});

const db = admin.database();
let isFetching = false;
let intervalId = null;

function toNumber(value) {
    // Keep `0` as valid, but treat null/undefined/NaN as missing.
    if (value === null || value === undefined) return undefined;
    const n = Number(value);
    if (!Number.isFinite(n)) return undefined;
    return n;
}

// Fetch from Firebase and save to MongoDB
async function fetchAndStore(userId) {
    try {
        const snapshot = await db.ref('/sensor_data').once('value');
        const data = snapshot.val();

        if (!data) return;

        const record = new SensorData({
            userId,
            temperature: data.temperature,
            pH: toNumber(data.pH),
            // Firebase publishes `water_level` (snake_case), but Mongo model uses `waterLevel`.
            waterLevel: toNumber(data.waterLevel ?? data.water_level),
            turbidity: toNumber(data.turbidity)
        });

        await record.save();
        console.log('Saved:', record);
    } catch (err) {
        console.error('Sync error:', err);
    }
}

function startFetching(userId) {
    if (isFetching) return;
    isFetching = true;
    intervalId = setInterval(() => fetchAndStore(userId), 5000);
    console.log('Fetching started');
}

function stopFetching() {
    if (!isFetching) return;
    clearInterval(intervalId);
    isFetching = false;
    intervalId = null;
    console.log('Fetching stopped');
}

function getStatus() {
    return isFetching;
}

module.exports = { startFetching, stopFetching, getStatus };