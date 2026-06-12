const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');

const userRoutes   = require('./routes/userRoutes');
const sensorRoutes = require('./routes/sensor');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Routes
app.use('/', userRoutes);
app.use('/sensor', sensorRoutes);
app.get('/graph/:sessionId/:sensor', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('graph', {
        sensor:    req.params.sensor,
        sessionId: req.params.sessionId
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});