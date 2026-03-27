const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const User    = require('../models/user');
const auth    = require('../middleware/auth');

// ─── Home ────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => res.render('index'));

// ─── Login ───────────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.render('login', { error: 'No account found with that email' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render('login', { error: 'Incorrect password' });

        req.session.userId    = user._id.toString();
        req.session.firstName = user.firstName;
        req.session.email     = user.email;

        res.redirect('/dashboard');
    } catch (err) {
        res.render('login', { error: 'Something went wrong. Try again.' });
    }
});

// ─── Signup ──────────────────────────────────────────────────────────────────
router.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword)
            return res.render('signup', { error: 'Passwords do not match' });

        if (password.length < 8)
            return res.render('signup', { error: 'Password must be at least 8 characters' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.render('signup', { error: 'An account with this email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ firstName, lastName, email, password: hashed });

        res.redirect('/login');
    } catch (err) {
        res.render('signup', { error: 'Something went wrong. Try again.' });
    }
});

// ─── Dashboard ───────────────────────────────────────────────────────────────
router.get('/dashboard', auth, (req, res) => {
    res.render('dashboard', { user: req.session });
});

// ─── Logout ──────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;