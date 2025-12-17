
// ----------------------
// Prize config
// ----------------------const express = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());


// ----------------------
// Prize config
// ----------------------
const prizes = [
  "₦500 OFF","TRY AGAIN","₦2,000 OFF","5% OFF","FREE CHARGE",
  "FREE DELIVERY","FREE CHARGER","FREE EARBUDS","₦1,000 OFF",
  "TRY AGAIN","FREE CHARGE","10% OFF","POWER BANK","TRY AGAIN","5% OFF"
];

// Weighted prizes (higher number = higher chance)
const prizeWeights = [5,25,3,8,6,4,2,1,5,20,6,4,1,20,8];

// Segment for weighted random selection
function pickWeightedIndex(weights){
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<weights.length;i++){
    r -= weights[i];
    if(r<=0) return i;
  }
  return weights.length-1;
}

// ----------------------
// User spin tracking with full user data
// ----------------------
const spins = {}; 
// Example: spins[userEmail] = { 
//   userName: "John Doe",
//   userPhone: "08012345678",
//   prize: "FREE CHARGE", 
//   timestamp: 1700000000000 
// }

app.post('/api/spin', (req, res) => {
  const { userId, userName, userPhone } = req.body;
  
  // Validate user data
  if (!userId) return res.status(400).json({ error: "Missing userId (email)" });
  if (!userName) return res.status(400).json({ error: "Missing userName" });
  if (!userPhone) return res.status(400).json({ error: "Missing userPhone" });
  
  const now = Date.now(); // current timestamp in ms
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
  
  // Temporarily ignore timestamp check for instant testing
if (spins[userId] && false) {
  return res.json({
    prize: spins[userId].prize,
    alreadySpun: true
  });
}
  
  // Pick weighted prize
  const prizeIndex = pickWeightedIndex(prizeWeights);
  const prize = prizes[prizeIndex];
  
  // Store full user data + prize + timestamp
  spins[userId] = { 
    userName, 
    userPhone, 
    prize, 
    timestamp: now 
  };
  
  // Log the win
  console.log(`🎉 ${userName} (${userPhone}) won: ${prize} at ${new Date(now).toLocaleString()}`);
  
  res.json({ prize, alreadySpun: false });
});

// ----------------------
// Optional: Get all spins (for admin view)
// ----------------------
app.get('/api/admin/spins', (req, res) => {
  const allSpins = Object.entries(spins).map(([email, data]) => ({
    email,
    ...data,
    date: new Date(data.timestamp).toLocaleString()
  }));
  res.json(allSpins);
});

// ----------------------
// Optional: Get user's spin history
// ----------------------
app.get('/api/user/:userId/spin', (req, res) => {
  const userId = req.params.userId;
  if (spins[userId]) {
    res.json({
      ...spins[userId],
      date: new Date(spins[userId].timestamp).toLocaleString()
    });
  } else {
    res.status(404).json({ error: "No spin found for this user" });
  }
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
