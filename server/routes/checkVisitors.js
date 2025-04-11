// routes/checkVisitors.js
import { db } from '../config/firebase.js';
import express from 'express';

const router = express.Router();
  
    // Increment visitor count
    router.get('/', async (req, res) => {
      try {
        const visitorCountRef = db.collection('visitor_count').doc('counter');
        const doc = await visitorCountRef.get();
  
        if (!doc.exists) {
          // If no visitor count exists, initialize with 0
          await visitorCountRef.set({ count: 1 });
          res.status(200).json({ message: 'Visitor count initialized', count: 1 });
        } else {
          // Otherwise, increment the count
          const currentCount = doc.data().count;
          await visitorCountRef.update({ count: currentCount + 1 });
          res.status(200).json({ message: 'Visitor count updated', count: currentCount + 1 });
        }
      } catch (error) {
        console.error('Error updating visitor count:', error);
        res.status(500).json({ error: 'Failed to update visitor count' });
      }
    });
  
export default router;
  