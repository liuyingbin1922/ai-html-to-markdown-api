const express = require('express');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const router = express.Router();
const upload = multer();

// Doc2x API configuration
const DOC2X_BASE_URL = 'https://v2.doc2x.noedgeai.com';
const API_KEY = 'sk-by2vmtc0y0w35535rlpqbno3vt4vp7mw'; // Store API key in environment variables

// Configure axios defaults
const doc2xClient = axios.create({
  baseURL: DOC2X_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});

// PDF parsing endpoint
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    console.log('formData', formData);
    formData.append('file', req.file.buffer, req.file.originalname);

    const parseResponse = await doc2xClient.post('/api/v2/parse/pdf', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const statusRespose = await doc2xClient.get('/api/v2/parse/status', formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

    console.log('convertResponse', statusRespose);

    // Start conversion process
    const convertResponse = await doc2xClient.post('/api/v2/convert/parse', {
      task_id: parseResponse.data.task_id
    });

    // Poll for results
    const result = await pollForResults(convertResponse.data.task_id);
    
    res.json(result);
  } catch (error) {
    console.error('Doc2x API Error:', error);
    res.status(500).json({
      error: 'Failed to process document',
      details: error.message
    });
  }
});

// Helper function to poll for results
async function pollForResults(taskId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await doc2xClient.get('/api/v2/convert/parse/result', {
      params: { task_id: taskId }
    });

    if (response.data.status === 'completed') {
      return response.data;
    }

    if (response.data.status === 'failed') {
      throw new Error('Conversion failed');
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Polling timeout exceeded');
}

module.exports = router; 