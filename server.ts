import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { data, prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            { text: `Analyze the following retail data and provide business insights and forecasting analysis. ${prompt}\n\nData: ${JSON.stringify(data)}` }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/forecast", async (req, res) => {
    try {
      const { historicalData, horizon } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            { text: `Act as a retail data scientist. Given this historical sales data, generate a forecast for the next ${horizon} periods. Return a JSON object with 'forecasted' array containing { date, sales, confidenceLow, confidenceHigh } and 'explanation' describing the trends. \n\nData: ${JSON.stringify(historicalData)}` }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Forecast error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuroForecast AI server running on http://localhost:${PORT}`);
  });
}

startServer();
