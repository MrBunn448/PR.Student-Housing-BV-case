const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// SOCKET IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// DB CONNECTION
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'student_housing'
});

db.connect(err => {
    if (err) console.log('⚠️ DB Not connected. Run "npm run db:setup"');
    else console.log('✅ Connected to MySQL DB');
});

// ROUTES
app.post('/api/announcements', (req, res) => {
    const { student_id, titel, datum, beschrijving } = req.body;
    const q = 'INSERT INTO aankondiging (student_id, titel, datum, beschrijving) VALUES (?, ?, ?, ?)';
    db.query(q, [student_id, titel, datum, beschrijving], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // TRIGGER ARDUINO LIGHT
        io.emit('trigger_light', { state: 'ON', color: 'orange' });
        
        res.status(201).json({ message: "Feestje aangekondigd!", id: result.insertId });
    });
});

app.get('/api/announcements', (req, res) => {
    const { filter } = req.query;
    let query = 'SELECT a.*, s.naam as organisator FROM aankondiging a JOIN student s ON a.student_id = s.id';
    if (filter === 'future') query += ' WHERE a.datum >= NOW()';
    query += ' ORDER BY a.datum ASC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/api/reports', (req, res) => {
    const { student_id, beschrijving } = req.body;
    db.query('INSERT INTO klacht (student_id, beschrijving) VALUES (?, ?)', 
    [student_id, beschrijving || 'Ongemeld feestje gemeld'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // TRIGGER ARDUINO ALARM
        io.emit('trigger_alarm', { state: 'ON', sound: 'siren' });
        
        res.status(201).json({ message: "Melding verstuurd." });
    });
});

app.post('/api/announcements/:id/read', (req, res) => {
    const { student_id } = req.body;
    db.query('INSERT IGNORE INTO announcement_views (aankondiging_id, student_id) VALUES (?, ?)', 
    [req.params.id, student_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Marked as read" });
    });
});

app.get('/api/announcements/:id/readers', (req, res) => {
    const q = 'SELECT s.naam FROM announcement_views v JOIN student s ON v.student_id = s.id WHERE v.aankondiging_id = ?';
    db.query(q, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results.map(r => r.naam));
    });
});

server.listen(3001, () => console.log('Server running on port 3001'));
