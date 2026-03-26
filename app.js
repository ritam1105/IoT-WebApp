const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const userRoutes=require('./routes/userRoutes');
const mongoose = require('mongoose');
const sensorRoutes = require('./routes/sensor');

app.use(express.static('public'));
// Needed for login/signup HTML form POST bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const DB_PATH=process.env.MONGO_URL;
// Connect MongoDB
mongoose.connect(DB_PATH)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/sensor', sensorRoutes);
app.use(userRoutes);
app.get('/graph/:sensor', (req, res) => res.render('graph', { sensor: req.params.sensor }));
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});