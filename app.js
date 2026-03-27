const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const sensorRoutes = require('./routes/sensor');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/sensor', sensorRoutes);
app.use(userRoutes);
app.get('/graph/:sessionId/:sensor', (req, res) =>
    res.render('graph', { sensor: req.params.sensor, sessionId: req.params.sessionId })
);

app.listen(3000, () => console.log('Server running at http://localhost:3000'));