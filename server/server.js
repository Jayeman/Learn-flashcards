const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
require('dotenv').config();

app.use(cors());

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'flashcard_app',
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to the database');
});

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Fetch a random card for the main question
// Fetch a random card for the main question
app.get('/get-random-card/:mode/:table', (req, res) => {
    const { mode, table } = req.params;
    const column = mode === 'syntax' ? 'syntax' : 'description';
    const query = `SELECT id AS ID, syntax AS Syntax, description AS Description FROM ${table} ORDER BY RAND() LIMIT 1`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching random card:', err);
            res.status(500).send('Database error');
            return;
        }
        res.json(results[0]); // Send the first result
    });
});

// Fetch 5 random rows for incorrect answers
app.get('/get-random-options/:mode/:table', (req, res) => {
    const { mode, table } = req.params;
    const excludeId = req.query.exclude; // Exclude the current question
    const column = mode === 'syntax' ? 'syntax' : 'description';
    const query = `
        SELECT syntax AS Syntax, description AS Description
        FROM ${table}
        WHERE id != ?
        ORDER BY RAND()
        LIMIT 5
    `;

    connection.query(query, [excludeId], (err, results) => {
        if (err) {
            console.error('Error fetching random options:', err);
            res.status(500).send('Database error');
            return;
        }
        res.json(results);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
