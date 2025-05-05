const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => res.render('index'));

app.post('/upload', upload.single('videoFile'), (req, res) => {
    res.redirect('/videos');
});

app.get('/videos', (req, res) => {
    const videos = fs.readdirSync('uploads/');
    res.render('videos', { videos });
});

app.get('/player/:nomFichier', (req, res) => {
    res.render('player', { videoFile: req.params.nomFichier });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));