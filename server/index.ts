import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import SensorData from "./models/SensorData";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB from Express"))
  .catch(err => console.error("MongoDB connection error:", err));

app.get("/api/pg-with-iot", async (req, res) => {
  try {
    // 1. Fetch properties and their rooms from Supabase
    // Enriched with food_details, google_maps_link, virtual_tour_link
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*, rooms(*)');

    if (error) {
      throw error;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    // 2. Combine with IoT Data (MongoDB or Mock)
    const result = await Promise.all(
      (properties || []).map(async (pg) => {
        
        const roomsWithSensors = await Promise.all((pg.rooms || []).map(async (room: any, roomIdx: number) => {
          let latestSensor = null;

          if (isMongoConnected) {
            // Fetch real telemetry from MongoDB
            latestSensor = await SensorData
              .findOne({ roomId: room.id })
              .sort({ createdAt: -1 });
          } else {
            // Fallback mock telemetry if MongoDB is offline due to IP whitelist
            latestSensor = {
              temperature: parseFloat((Math.sin(Date.now() / 10000 + roomIdx) * 2 + 23).toFixed(1)),
              electricity: parseFloat((Math.cos(Date.now() / 15000 + roomIdx) * 0.5 + 1.5).toFixed(1)),
              // The frontend will use the Supabase 'status' column for occupancy anyway
            };
          }

          return {
            ...room,
            // Map Supabase 'id' to '_id' for frontend compatibility
            _id: room.id,
            roomNumber: room.room_number,
            sensor: latestSensor
          };
        }));

        return {
          ...pg,
          // Map Supabase 'id' to '_id' for frontend compatibility
          _id: pg.id,
          rooms: roomsWithSensors
        };
      })
    );

    res.json({
      data: result,
      dbStatus: {
        supabase: true,
        mongodb: isMongoConnected
      }
    });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Mock state for room controls (since MongoDB is currently offline)
const roomControlState: Record<string, any> = {};

app.post("/api/room-control", (req, res) => {
  const { roomId, device, state } = req.body;
  if (!roomId || !device) {
    return res.status(400).json({ error: "Missing roomId or device" });
  }

  if (!roomControlState[roomId]) {
    roomControlState[roomId] = { ac: false, lights: true, lock: true };
  }

  roomControlState[roomId][device] = state;
  console.log(`[CONTROL] Room ${roomId} ${device} set to ${state}`);
  
  res.json({ success: true, state: roomControlState[roomId] });
});

app.get("/api/room-control/:roomId", (req, res) => {
  const { roomId } = req.params;
  const state = roomControlState[roomId] || { ac: false, lights: true, lock: true };
  res.json(state);
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
