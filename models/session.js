const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId:    { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt:   { type: Date }
});

module.exports = mongoose.model('Session', sessionSchema);
