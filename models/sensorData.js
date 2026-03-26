const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    temperature: Number,
    pH: Number,
    waterLevel: Number,
    turbidity: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorSchema);