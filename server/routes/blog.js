import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../config/firebase.js';

const router = express.Router();

// Validation middleware
const validateBlog = [
  body('title').notEmpty().withMessage('Title is required').trim().escape(),
  body('content').notEmpty().withMessage('Content is required'),
  body('imageUrl').isURL().withMessage('Invalid image URL').optional(),
  body('author').notEmpty().withMessage('Author is required').trim().escape(),
  body('authorImage').isURL().withMessage('Invalid author image URL').optional(),
  body('authorDescription').trim().escape().optional().isString().withMessage('Author description must be a string'),
  body('tags').isArray().withMessage('Tags should be an array').optional(),
];


// Create a new blog post

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogsSnapshot = await db.collection('blogs').orderBy('createdAt', 'desc').get();
    const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts', details: error.message });
  }
});

// Get a single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blogDoc = await db.collection('blogs').doc(id).get();

    if (!blogDoc.exists) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ id: blogDoc.id, ...blogDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post', details: error.message });
  }
});

export default router;
