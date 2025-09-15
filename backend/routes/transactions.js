const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

router.post('/', async (req, res) => {
  try {
    console.log('Received transaction data:', req.body);
    const { amount, description, category, type, date } = req.body;

    console.log('Parsed data:', { amount, description, category, type, date });

    if (!amount || !type) {
      console.log('Validation failed:', {
        amountMissing: !amount,
        typeMissing: !type
      });
      return res.status(400).json({
        success: false,
        message: 'Amount and type are required',
        received: { amount, description, category, type, date }
      });
    }

    const transaction = {
      amount: parseFloat(amount),
      description: description && description.trim() ? description.trim() : 'No description',
      category: category || 'Other',
      type: type,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('transactions').add(transaction);

    res.status(201).json({
      success: true,
      id: docRef.id,
      transaction: { id: docRef.id, ...transaction },
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to create transaction'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { limit = 50, category, type } = req.query;

    // Simple query without ordering to avoid index requirements
    let query = db.collection('transactions').limit(parseInt(limit));

    const snapshot = await query.get();
    const transactions = [];

    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      transactions,
      count: transactions.length,
      message: 'Transactions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch transactions'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('transactions').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: doc.id,
        ...doc.data()
      },
      message: 'Transaction retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch transaction'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category, type, date } = req.body;

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category;
    if (type !== undefined) updates.type = type;
    if (date !== undefined) updates.date = date;

    await db.collection('transactions').doc(id).update(updates);

    const updatedDoc = await db.collection('transactions').doc(id).get();

    if (!updatedDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      },
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to update transaction'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('transactions').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await db.collection('transactions').doc(id).delete();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to delete transaction'
    });
  }
});

module.exports = router;