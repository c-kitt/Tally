const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./config/firebase');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({ status: 'Backend is running', timestamp: new Date().toISOString() });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const testDoc = await db.collection('test').doc('connection').set({
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });

    const retrievedDoc = await db.collection('test').doc('connection').get();
    res.json({
      success: true,
      data: retrievedDoc.data(),
      message: 'Firestore connection working!'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Tally Backend API', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});