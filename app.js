const express = require('express');
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

const path = require('path');

app.get('/', (req, res) => {
    res.render('dashboard');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});