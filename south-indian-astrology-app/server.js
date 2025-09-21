import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for astrology API
app.post('/api/chart', async (req, res) => {
  try {
    const { apiKey, baseUrl, birthData } = req.body;
    
    if (!apiKey || !baseUrl || !birthData) {
      return res.status(400).json({ 
        error: 'Missing required fields: apiKey, baseUrl, or birthData' 
      });
    }

    const url = `${baseUrl.replace(/\/$/, '')}/chart`;
    
    console.log('Proxying request to:', url);
    console.log('Birth data:', birthData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(birthData)
    });

    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return res.status(response.status).json({ 
        error: `API Error (${response.status}): ${response.statusText}`,
        detail: errorText 
      });
    }

    const data = await response.json();
    console.log('API response received successfully');
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy server error', 
      detail: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on http://0.0.0.0:${PORT}`);
});