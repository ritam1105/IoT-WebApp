const express = require('express');
const router = express.Router();
const SensorData = require('../models/sensorData');
const { startFetching, stopFetching, getStatus } = require('../services/firebaseSync');

const USER_ID = 'user_001'; // replace with real session user later

// Start/Stop/Restart controls
router.post('/start',   (req, res) => { startFetching(USER_ID); res.json({ status: 'started' }); });
router.post('/stop',    (req, res) => { stopFetching();          res.json({ status: 'stopped' }); });
router.post('/restart', (req, res) => {
    stopFetching();
    setTimeout(() => startFetching(USER_ID), 500);
    res.json({ status: 'restarted' });
});

// Get last 50 records
router.get('/data', async (req, res) => {
    const records = await SensorData.find({ userId: USER_ID })
        .sort({ timestamp: -1 }).limit(50);
    res.json(records);
});

// Get averages
router.get('/averages', async (req, res) => {
    const result = await SensorData.aggregate([
        { $match: { userId: USER_ID } },
        { $group: {
            _id: null,
            avgTemp:       { $avg: '$temperature' },
            avgPH:         { $avg: '$pH' },
            avgWaterLevel: { $avg: '$waterLevel' },
            avgTurbidity:  { $avg: '$turbidity' }
        }}
    ]);
    res.json(result[0] || {});
});

// Get data for graph (single sensor)
router.get('/graph/:sensor', async (req, res) => {
    const { sensor } = req.params;
    const allowed = ['temperature', 'pH', 'waterLevel', 'turbidity'];
    if (!allowed.includes(sensor)) return res.status(400).json({ error: 'Invalid sensor' });

    const records = await SensorData.find({ userId: USER_ID })
        .sort({ timestamp: -1 }).limit(100)
        .select(`${sensor} timestamp -_id`);
    res.json(records.reverse());
});

module.exports = router;