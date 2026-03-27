require('dotenv').config();
const admin = require('firebase-admin');
const SensorData = require('../models/sensorData');

// Init Firebase only once (prevents "already exists" errors in dev reloads)
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

function toNumber(value) {
    if (value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
}

async function readSensorPayload() {
    // Support both common paths; prefer /sensor_data when present.
    const primary = await db.ref('/sensor_data').once('value');
    if (primary.exists()) return primary.val();
    const fallback = await db.ref('/sensor').once('value');
    return fallback.val();
}

// Fetch from Firebase and save to MongoDB (bound to current user/session)
async function fetchAndStore() {
    try {
        if (!currentUserId || !currentSessionId) return;

        const data = await readSensorPayload();
        if (!data) return;

        const record = new SensorData({
            userId: currentUserId,
            sessionId: currentSessionId,
            temperature: toNumber(data.temperature),
            pH: toNumber(data.pH),
            // Firebase may publish `water_level` (snake_case)
            waterLevel: toNumber(data.waterLevel ?? data.water_level),
            turbidity: toNumber(data.turbidity)
        });

        await record.save();
    } catch (err) {
        console.error('Sync error:', err?.message ?? err);
    }
}

function startFetching(userId, sessionId) {
    if (isFetching) return;
    currentUserId = userId;
    currentSessionId = sessionId;

    isFetching = true;
    fetchAndStore(); // immediate first fetch
    intervalId = setInterval(fetchAndStore, 5000);
}

function stopFetching() {
    if (!isFetching) return;
    clearInterval(intervalId);
    isFetching = false;
    intervalId = null;
}

function getStatus() {
    return isFetching;
}

function getCurrentSession() {
    return currentSessionId;
}

module.exports = { startFetching, stopFetching, getStatus, getCurrentSession };