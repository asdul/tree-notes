const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const port = 3011;

// Create data directory if it doesn't exist
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure data directory and file exist
async function ensureDataFile() {
    try {
        // First ensure data directory exists
        try {
            await fs.access(DATA_DIR);
        } catch {
            await fs.mkdir(DATA_DIR, { recursive: true });
        }

        // Then check for notes.json
        try {
            await fs.access(DATA_FILE);
            // Verify file has valid content
            const content = await fs.readFile(DATA_FILE, 'utf8');
            JSON.parse(content); // This will throw if content is invalid JSON
        } catch (error) {
            // If file doesn't exist or is invalid, create it with empty notes array
            await fs.writeFile(DATA_FILE, JSON.stringify({ notes: [] }, null, 2));
        }
    } catch (error) {
        console.error('Error ensuring data file exists:', error);
        throw error;
    }
}

const connectedClients = new Set();

// Read notes from file
async function readNotes() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.notes ? { notes: parsed.notes } : { notes: [] };
    } catch (error) {
        console.error('Error reading notes:', error);
        return { notes: [] };
    }
}

// Write notes to file
async function writeNotes(notes) {
    try {
        if (!Array.isArray(notes)) {
            console.error('Invalid notes format:', notes);
            return;
        }
        await fs.writeFile(DATA_FILE, JSON.stringify({ notes }, null, 2));
    } catch (error) {
        console.error('Error writing notes:', error);
    }
}

// Broadcast to all clients except sender
async function broadcast(message, sender = null) {
    const messageString = JSON.stringify(message);
    for (const client of connectedClients) {
        if (client !== sender && client.readyState === 1) {
            client.send(messageString);
        }
    }
}

// Initialize server
async function initServer() {
    await ensureDataFile();

    // Serve static files
    app.use(express.static('./'));
    app.use(express.json());

    // REST endpoints
    app.get('/api/notes', async (req, res) => {
        try {
            const notes = await readNotes();
            res.json(notes);
        } catch (error) {
            console.error('Error serving notes:', error);
            res.status(500).json({ error: 'Failed to read notes' });
        }
    });

    app.post('/api/notes', async (req, res) => {
        try {
            await writeNotes(req.body.notes);
            res.json({ success: true });
        } catch (error) {
            console.error('Error saving notes:', error);
            res.status(500).json({ error: 'Failed to save notes' });
        }
    });

    // WebSocket handling
    wss.on('connection', async (ws) => {
        console.log('Client connected');
        connectedClients.add(ws);

        // Send initial data to new client
        const notes = await readNotes();
        ws.send(JSON.stringify({
            type: 'full_sync',
            data: notes
        }));

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'update' && Array.isArray(data.data.notes)) {
                    // Save to file
                    await writeNotes(data.data.notes);
                    
                    // Broadcast to other clients
                    await broadcast({
                        type: 'update',
                        data: { notes: data.data.notes }
                    }, ws);
                }
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            connectedClients.delete(ws);
        });
    });

    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

initServer().catch(console.error);



