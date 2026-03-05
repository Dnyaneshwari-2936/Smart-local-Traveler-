import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("voya.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination TEXT,
    duration INTEGER,
    budget_level TEXT,
    interests TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Itinerary Generation Endpoint
  app.post("/api/itinerary/generate", async (req, res) => {
    const { location, duration, budgetLevel, mood, interests } = req.body;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.error("Invalid or missing GEMINI_API_KEY");
        return res.status(500).json({ error: "Gemini API key is not configured correctly in the environment." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a detailed ${duration}-day travel itinerary for someone visiting ${location} in Pune, India. 
        The traveler is in a '${mood}' mood.
        Budget Level: ${budgetLevel}. 
        Interests: ${interests}. 
        Include: Daily activities focused on the mood '${mood}', estimated costs in INR, and local Pune tips.
        Also suggest 3 'nearby places' for each day with a short description and a 'image_keyword' for each place.
        Format the response as a structured JSON object with a 'title', 'summary', and 'days' array. 
        Each day should have 'day_number', 'theme', 'activities' (each with 'time', 'description', 'cost'), and 'nearby_places' (each with 'name', 'description', 'image_keyword').`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day_number: { type: Type.INTEGER },
                    theme: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          description: { type: Type.STRING },
                          cost: { type: Type.STRING }
                        }
                      }
                    },
                    nearby_places: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          description: { type: Type.STRING },
                          image_keyword: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const itineraryData = JSON.parse(response.text || "{}");
      
      // Save to DB
      const stmt = db.prepare(`
        INSERT INTO itineraries (destination, duration, budget_level, interests, content)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(location, duration, budgetLevel, interests, JSON.stringify(itineraryData));

      res.json(itineraryData);
    } catch (error) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: "Failed to generate itinerary" });
    }
  });

  // Get Saved Itineraries
  app.get("/api/itineraries", (req, res) => {
    const rows = db.prepare("SELECT * FROM itineraries ORDER BY created_at DESC").all();
    res.json(rows.map(row => ({
      ...row,
      content: JSON.parse(row.content as string)
    })));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voya Server running on http://localhost:${PORT}`);
  });
}

startServer();
