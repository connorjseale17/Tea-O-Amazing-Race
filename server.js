const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database File if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  const initialData = { users: [] };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData));
  console.log('Created new database file: db.json');
}

// Helper to read DB
const readDb = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return { users: [] };
  }
};

// Helper to write DB
const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing DB:", err);
  }
};

// --- ROUTES ---

// GET: List all users
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users);
});

// POST: Add a new user
app.post('/api/users', (req, res) => {
  const { name, teamName, iconId } = req.body;
  
  if (!name || !iconId) {
    return res.status(400).json({ error: 'Name and iconId are required' });
  }

  const db = readDb();
  
  // Basic validation for max users
  if (db.users.length >= 20) {
    return res.status(400).json({ error: 'Race is full (20 users max)' });
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    teamName: teamName || "", 
    iconId,
    steps: 0,
    stepHistory: [] // Initialize history array
  };

  db.users.push(newUser);
  writeDb(db);
  
  console.log(`User joined: ${name} (${teamName || 'No Team Name'})`);
  res.status(201).json(newUser);
});

// POST: Add steps to a user
app.post('/api/users/:id/steps', (req, res) => {
  const { id } = req.params;
  const { steps } = req.body;
  const stepsToAdd = parseInt(steps);

  if (isNaN(stepsToAdd)) {
    return res.status(400).json({ error: 'Valid step count required' });
  }

  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Ensure stepHistory exists (migration for old records)
  if (!db.users[userIndex].stepHistory) {
    db.users[userIndex].stepHistory = [];
  }

  // Update total steps
  db.users[userIndex].steps += stepsToAdd;

  // Add to history with timestamp
  db.users[userIndex].stepHistory.push({
    amount: stepsToAdd,
    date: new Date().toISOString()
  });

  writeDb(db);

  console.log(`Updated ${db.users[userIndex].name}: +${stepsToAdd} steps (Total: ${db.users[userIndex].steps})`);
  res.json(db.users[userIndex]);
});

// DELETE: Remove a user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const initialLength = db.users.length;
  
  db.users = db.users.filter(u => u.id !== id);

  if (db.users.length === initialLength) {
    return res.status(404).json({ error: 'User not found' });
  }

  writeDb(db);
  console.log(`User removed: ${id}`);
  res.status(200).json({ success: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🏁 Tea&O Amazing Race Backend running on http://localhost:${PORT}`);
});