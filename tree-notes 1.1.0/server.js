const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3011;  // Changed from 3000 to 3011

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from current directory
app.use(express.static('./'));

// Path to data file - ensure this path is correct
const DATA_FILE = path.join(__dirname, 'data', 'notes.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// GET notes
app.get('/api/notes', async (req, res) => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DATA_FILE, 'utf8')
            .catch(() => '[]'); // Return empty array if file doesn't exist
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading notes:', err);
        res.status(500).json({ error: 'Failed to read notes' });
    }
});

// SAVE notes
app.post('/api/notes', async (req, res) => {
    try {
        await ensureDataDir();
        await fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving notes:', err);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
