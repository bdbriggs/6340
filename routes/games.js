// routes/games.js
const express = require('express');
const router = express.Router();

// Temporary "empty slots" for the games gallery page
// Later, you can replace these or expand them if you store games dynamically.
const games = [
  { id: 1, title: 'Rocket Boost', description: 'A tiny rocket that boosts with clicks.', status: 'coming soon' },
  { id: 2, title: 'Ricochet', description: 'A bouncy ball + expanding waves.', status: 'coming soon' },
  { id: 3, title: 'Chomper', description: 'A cartoon blob that eats food and avoids poison.', status: 'coming soon' },
  { id: 4, title: 'Fuego Fury', description: 'Another experiment is on the way.', status: 'reserved' }
];

// Route should be '/' when mounted with app.use(), or '/games' if mounted with app.use('/games', router)
router.get('/', (req, res) => {
  console.log('[games] Request received at:', new Date().toISOString());
  res.render('games', { title: 'Games Gallery', games });
});

module.exports = router;
