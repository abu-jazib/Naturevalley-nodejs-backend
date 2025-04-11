// routes/upload.js
import express from 'express';
import multer from 'multer';  // To handle file uploads
import { containerClient } from '../config/azureBlobStorage.js';
import { db } from '../config/firebase.js';
import path from 'path';  // For handling file extensions

const uploadRouter = express.Router();

// Multer setup for file handling
const storage = multer.memoryStorage();  // Save files in memory before uploading to Azure
const upload = multer({ storage: storage });

// POST route for uploading file
uploadRouter.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Request body:', req.body);  // Log the request body
  console.log('File received:', req.file);  // Log the file object

  const { fileName } = req.body;  // Get the custom file name from the request body

  // Check if file or fileName is not provided
  if (!req.file || !fileName) {
    return res.status(400).send({ error: 'No file uploaded or no file name provided' });
  }

  try {
    // Use the custom file name and add the file extension from the original file
    const blobName = `${fileName}${path.extname(req.file.originalname)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file to Azure Blob Storage
    await blockBlobClient.upload(req.file.buffer, req.file.size);
    const fileUrl = blockBlobClient.url;

    // Save file metadata to Firebase Firestore under "assets" collection
    await db.collection('assets').doc(blobName).set({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      uploadedAt: new Date(),
    });

    res.status(200).send({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading file to Azure Blob:', error);
    res.status(500).send({ error: 'Failed to upload file to Azure Blob Storage', details: error.message });
  }
});

// GET route to retrieve the file URL from Firestore based on the fileName
uploadRouter.get('/file/:fileName', async (req, res) => {
  const { fileName } = req.params;  // Get fileName from URL params

  try {
    // Query Firestore to get the document corresponding to the fileName
    const docRef = db.collection('assets').doc(fileName);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: 'File not found in Firestore' });
    }

    // If the document exists, return the file URL
    const fileData = doc.data();
    res.status(200).send({ fileUrl: fileData.fileUrl });
  } catch (error) {
    console.error('Error retrieving file URL from Firestore:', error);
    res.status(500).send({ error: 'Failed to retrieve file URL from Firestore', details: error.message });
  }
});

// GET route to retrieve all assets from Firestore
uploadRouter.get('/assets', async (req, res) => {
  try {
    // Query Firestore to get all documents in the "assets" collection
    const assetsSnapshot = await db.collection('assets').get();

    if (assetsSnapshot.empty) {
      return res.status(404).send({ error: 'No assets found in Firestore' });
    }

    // Create an array of file metadata
    const assets = assetsSnapshot.docs.map(doc => ({
      fileName: doc.data().fileName,
      fileUrl: doc.data().fileUrl,
      uploadedAt: doc.data().uploadedAt,
    }));

    res.status(200).send({ assets });
  } catch (error) {
    console.error('Error retrieving assets from Firestore:', error);
    res.status(500).send({ error: 'Failed to retrieve assets from Firestore', details: error.message });
  }
});

export default uploadRouter;
