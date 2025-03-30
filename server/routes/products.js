import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/firebase.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').notEmpty().trim().escape(),
  body('description').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('imageUrl').optional().isURL(),
  body('category').notEmpty().trim()
];

// Create product (admin only)
router.post('/', authenticateAdmin, validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, price, imageUrl, category } = req.body;
    const productRef = db.collection('products').doc();
    await productRef.set({
      name,
      description,
      price,
      imageUrl,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({ id: productRef.id, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.collection('products');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const productsSnapshot = await query.orderBy('createdAt', 'desc').get();
    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateAdmin, validateProduct, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, category } = req.body;
    await db.collection('products').doc(id).update({
      name,
      description,
      price,
      imageUrl,
      category,
      updatedAt: new Date()
    });
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;