const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

let sessionVideos = [];

let favorites = [];
try {
  favorites = JSON.parse(fs.readFileSync('favorites.json'));
} catch (err) {
  favorites = [];
}

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('index', { videos: sessionVideos });
});

app.post('/upload', upload.single('videoFile'), (req, res) => {
    if (req.file) {
        sessionVideos.push(req.file.originalname);
    }
    res.redirect('/');
});

app.use((req, res, next) => {
    if (req.path !== '/') {
        sessionVideos = [];
    }
    next();
});

app.get('/videos', (req, res) => {
    const videos = fs.readdirSync('uploads/');
    res.render('videos', { 
        videos,
        favoriteVideos: favorites.filter(fav => videos.includes(fav))
    });
});

app.get('/favorites', (req, res) => {
    const allVideos = fs.readdirSync('uploads/');
    const favoriteVideos = allVideos.filter(video => favorites.includes(video));
    res.render('favorites', {
        favoriteVideos: favoriteVideos
    });
});

app.get('/player/:nomFichier', (req, res) => {
    res.render('player', { videoFile: req.params.nomFichier });
});

app.post('/rename-video', (req, res) => {
    const { oldName, newName } = req.body;
    const oldPath = path.join(__dirname, 'uploads', oldName);
    const newPath = path.join(__dirname, 'uploads', newName);

    try {
        fs.renameSync(oldPath, newPath);
        
        const favIndex = favorites.indexOf(oldName);
        if (favIndex !== -1) {
            favorites[favIndex] = newName;
            fs.writeFileSync('favorites.json', JSON.stringify(favorites));
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors du renommage:', error);
        res.json({ success: false });
    }
});

app.post('/delete-video', (req, res) => {
    const { videoName } = req.body;
    const videoPath = path.join(__dirname, 'uploads', videoName);

    try {
        fs.unlinkSync(videoPath);
        
        const favIndex = favorites.indexOf(videoName);
        if (favIndex !== -1) {
            favorites.splice(favIndex, 1);
            fs.writeFileSync('favorites.json', JSON.stringify(favorites));
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.json({ success: false });
    }
});

app.post('/toggle-favorite', (req, res) => {
    const { videoName } = req.body;
    const index = favorites.indexOf(videoName);
    
    if (index === -1) {
        favorites.push(videoName);
    } else {
        favorites.splice(index, 1);
    }
    
    fs.writeFileSync('favorites.json', JSON.stringify(favorites));
    
    res.json({ success: true });
});

app.listen(3000, () => console.log('Serveur en écoute sur http://localhost:3000'));