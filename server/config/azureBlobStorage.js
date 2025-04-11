// azureBlobStorage.js
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = 'assets';  // You can change this name if needed
const containerClient = blobServiceClient.getContainerClient(containerName);

// Function to check if Azure Blob Storage is accessible
const checkAzureBlobConnection = async () => {
  try {
    // Try to get container properties as a basic health check
    await containerClient.getProperties();
    console.log('Azure Blob Storage is connected and the container exists.');
  } catch (error) {
    // Improved error handling with more information
    console.error('Error connecting to Azure Blob Storage:', error.message);
    console.error('Possible causes:');
    console.error('- Incorrect connection string');
    console.error('- Incorrect container name or permissions');
    throw new Error('Azure Blob Storage connection failed');
  }
};

// Perform a connection check when the app starts
checkAzureBlobConnection().catch(err => {
  console.error('Azure Blob Storage check failed:', err.message);
  process.exit(1);  // Exit the app if connection to Azure Blob Storage fails
});

export { containerClient };
