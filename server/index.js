import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import blogRoutes from './routes/blog.js';
import productRoutes from './routes/products.js';
import formRoutes from './routes/forms.js';
import subscribeRoutes from "./routes/subscribe.js";
import assetsUploadRoutes from './routes/assetsUpload.js';
import checkVisitorsRoutes from './routes/checkVisitors.js';


dotenv.config();

const app = express();
const PORT = 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.send('<h4>API is working</h4>');
});

// Routes
app.use('/api/checkVisitors', checkVisitorsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/products', productRoutes);
app.use('/api/forms', formRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use('/api/assets-upload', assetsUploadRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Ensure server runs only on PORT 4000
app.listen(PORT, () => {
  if (process.env.PORT && process.env.PORT !== '4000') {
    console.warn(`Warning: Server is forced to run on port ${PORT}, ignoring process.env.PORT (${process.env.PORT}).`);
  }
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error(`Failed to start server on port ${PORT}:`, err.message);
  process.exit(1);
});
