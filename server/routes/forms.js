import express from 'express';  
import { body, validationResult } from 'express-validator';  
import { db } from '../config/firebase.js'; 
import { sendSupportEmail } from "../utils/mail.js"; 
  
const router = express.Router();  
  
// Validation middleware  
const validateForm = [  
  body('name').notEmpty().trim().escape(),  
  body('email').isEmail().normalizeEmail(),  
  body('number').notEmpty(),  
  body('message').notEmpty().trim(),  
  body('subject').notEmpty().trim()  
];  
// Submit form (public)  
router.post('/', validateForm, async (req, res) => {  
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {  
    return res.status(400).json({ errors: errors.array() });  
  }  
  
  try {  
    const { name, email, number, message, subject } = req.body;  
  
    const formRef = db.collection('forms').doc();  
    await formRef.set({  
      name,  
      email,  
      number,  
      message,  
      subject,  
      status: 'pending',  
      createdAt: new Date()  
    });  

    await sendSupportEmail(email,name);
  
    res.status(201).json({ message: 'Form submitted successfully' });  
  } catch (error) {  
    console.error('Error submitting form:', error); // Log the error  
    res.status(500).json({ error: 'Failed to submit form' });  
  }  
});  
  
// Get all form submissions (admin only)  
router.get('/', async (req, res) => {  
  try {  
    const formsSnapshot = await db.collection('forms')  
      .orderBy('createdAt', 'desc')  
      .get();  
  
    const forms = [];  
    formsSnapshot.forEach(doc => {  
      forms.push({ id: doc.id, ...doc.data() });  
    });  
    res.json(forms);  
  } catch (error) {  
    console.error('Error fetching forms:', error); // Log the error  
    res.status(500).json({ error: 'Failed to fetch form submissions' });  
  }  
});  
  
// Update form status (admin only)  
router.patch('/:id/status',  
  body('status').isIn(['pending', 'processed', 'completed']),  
  async (req, res) => {  
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {  
      return res.status(400).json({ errors: errors.array() });  
    }  
  
    try {  
      const { id } = req.params;  
      const { status } = req.body;  
      await db.collection('forms').doc(id).update({  
        status,  
        updatedAt: new Date()  
      });  
      res.json({ message: 'Form status updated successfully' });  
    } catch (error) {  
      console.error('Error updating form status:', error); // Log the error  
      res.status(500).json({ error: 'Failed to update form status' });  
    }  
  }  
);  
  
export default router;  