const express = require('express');
const router  = express.Router();
const SensorData = require('../models/sensorData');
const mongoose = require('mongoose'); 
const Session    = require('../models/session');
const { startFetching, stopFetching, getStatus, getCurrentSession } = require('../services/firebaseSync');

//const USER_ID = 'user_001'; // replace with req.session.userId when auth is done

// ─── START — resume fetching for the current/last session ────────────────────
router.post('/start', async (req, res) => {
    try {
        const USER_ID = req.session?.userId;
        if (!USER_ID) return res.status(401).json({ error: 'Not logged in' });

        if (getStatus()) return res.json({ status: 'already running', sessionId: getCurrentSession() });

        let session = await Session.findOne({ userId: USER_ID, endedAt: null }).sort({ startedAt: -1 });
        if (!session) session = await Session.create({ userId: USER_ID });

        startFetching(USER_ID, session._id);
        res.json({ status: 'started', sessionId: session._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ─── STOP — pause fetching, keep session open ────────────────────────────────
router.post('/stop', (req, res) => {
    const USER_ID = req.session?.userId || 'guest';
    stopFetching();
    res.json({ status: 'stopped', sessionId: getCurrentSession() });
});

// ─── NEW — close current session, start a fresh one ─────────────────────────
router.post('/new', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        stopFetching();

        // Close any open sessions
        await Session.updateMany({ userId: USER_ID, endedAt: null }, { endedAt: new Date() });

        // Create a fresh session
        const session = await Session.create({ userId: USER_ID });
        startFetching(USER_ID, session._id);
        res.json({ status: 'new session started', sessionId: session._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET active session id ───────────────────────────────────────────────────
router.get('/session', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        const session = await Session.findOne({ userId: USER_ID, endedAt: null }).sort({ startedAt: -1 });
        res.json({ sessionId: session?._id || null, isRunning: getStatus() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET latest record for current session ───────────────────────────────────
router.get('/latest', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        const sessionId = getCurrentSession();
        if (!sessionId) return res.json({});
        const record = await SensorData.findOne({ sessionId }).sort({ timestamp: -1 });
        res.json(record || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET all records for a specific session ──────────────────────────────────
router.get('/data/:sessionId', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        const records = await SensorData.find({ sessionId: req.params.sessionId })
            .sort({ timestamp: -1 }).limit(50);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET averages for a specific session ─────────────────────────────────────
router.get('/averages/:sessionId', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        if (!mongoose.Types.ObjectId.isValid(req.params.sessionId)) {
            return res.status(400).json({ error: 'Invalid sessionId' });
        }
        const result = await SensorData.aggregate([
            { $match: { sessionId: new mongoose.Types.ObjectId(req.params.sessionId) } },  // 👈 new
            { $group: {
                _id: null,
                avgTemp:       { $avg: '$temperature' },
                avgPH:         { $avg: '$pH' },
                avgWaterLevel: { $avg: '$waterLevel' },
                avgTurbidity:  { $avg: '$turbidity' }
            }}
        ]);
        res.json(result[0] || {});
    } catch (err) {
        console.error('Averages error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET graph data for a sensor within a session ────────────────────────────
router.get('/graph/:sessionId/:sensor', async (req, res) => {
    try {
        const USER_ID = req.session?.userId || 'guest';
        const { sessionId, sensor } = req.params;
        const allowed = ['temperature', 'pH', 'waterLevel', 'turbidity'];
        if (!allowed.includes(sensor)) return res.status(400).json({ error: 'Invalid sensor' });

        const records = await SensorData.find({ sessionId })
            .sort({ timestamp: -1 }).limit(100)
            .select(`${sensor} timestamp -_id`);
        res.json(records.reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
