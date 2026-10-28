import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    // Convert messages to Gemini format
    // messages should be an array of { role: 'user' | 'model', content: string }
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: "You are the EV Rescue Expert assistant for the EV Rescue app. You provide 24/7 support for electric vehicle riders (scooters, bikes, cars). You help with charging station locations, mechanical troubleshooting, and app navigation. Your style is elite, premium, and efficient. Use the brand colors Emerald and Navy in your descriptions if appropriate. Keep responses helpful and concise.",
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
});

// Geocoding Proxy
app.get('/api/geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`
    );
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Geocoding Proxy Error:', error);
    res.status(500).json({ error: 'Failed to proxy geocoding request' });
  }
});

// Vite integration
let vite;
try {
  vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR === 'true' ? false : { port: 24679 } // Use a specific port to avoid conflicts
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} catch (err) {
  console.error('Failed to create Vite server:', err);
}

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
