import express from "express";
import { existsSync, readFileSync, writeFileSync } from "node:fs";


type LeaderboardEntry = { score: number; timestamp: string };
const LEADERBOARD_FILE = new URL("./leaderboard.json", import.meta.url);
const app = express();
app.use(express.json());


// TODO: Add your storage functions and routes here.
// loadLeaderboard(): LeaderboardEntry[]
// If !existsSync(LEADERBOARD_FILE), return [].
// Read the file into a string variable: const text = readFileSync(LEADERBOARD_FILE, "utf8");
// Parse and return the entries: return JSON.parse(text) as LeaderboardEntry[];
function loadLeaderboard(): LeaderboardEntry[] {
  if (existsSync(LEADERBOARD_FILE)) {
    const data = readFileSync(LEADERBOARD_FILE, "utf8");
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }
  return [];
}

// saveLeaderboard(entries: LeaderboardEntry[]): void
// Define our stringified entries: const jsonString = JSON.stringify(entries);
// Save to the leaderboard file: writeFileSync(LEADERBOARD_FILE, jsonString, "utf8").
function saveLeaderboard(entries: LeaderboardEntry[]): void {
  writeFileSync(LEADERBOARD_FILE, JSON.stringify(entries), "utf8");
}

app.get("/api/leaderboard", (_req, res) => {
  // Store the result: const entries = loadLeaderboard();
  // Send it: res.json(entries);
  const entries = loadLeaderboard();
  res.json(entries);
 });
 
 
 app.post("/api/leaderboard", (req, res) => {
  // Call: saveLeaderboard(req.body);
  // Respond: res.json({ message: "Saved" });
   saveLeaderboard(req.body);
   res.json({ message: "Saved" });
 });

app.listen(3001, () => console.log("Server running on port 3001"));

