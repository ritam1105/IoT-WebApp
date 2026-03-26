exports.getHome=(req,res)=>{
    res.render('index');
}
exports.getDashboard=(req,res)=>{
    res.render('dashboard');
}
exports.getLogin=(req,res)=>{
    res.render('login');
}
exports.getSignIn=(req,res)=>{
    res.render('signup');
}

// Simple placeholder handlers so login/signup forms don't 404.
// (There is currently no auth/session implementation in this project.)
exports.postLogin = (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).render('login', { error: 'Email and password are required.' });
    }

    return res.redirect('/dashboard');
};

exports.postSignup = (req, res) => {
    const { email, password, confirmPassword } = req.body || {};

    if (!email || !password || !confirmPassword) {
        return res.status(400).render('signup', { error: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).render('signup', { error: 'Passwords do not match.' });
    }

    return res.redirect('/login');
};