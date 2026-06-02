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

const MOCK_PROPERTIES_FALLBACK = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "FORUM PRO BOYS",
    area: "koramangla",
    address: "silk board, Koramangala, sg palya, MG road, nexus",
    city: "Bangalore",
    price_range: "12k - 24k",
    is_active: true,
    food_details: "3-meals North & South Indian meals included",
    google_maps_link: "https://maps.google.com",
    virtual_tour_link: "https://drive.google.com",
    rooms: [
      { id: "r1", property_id: "22222222-2222-2222-2222-222222222222", room_number: "101", floor: "1st", bed_count: 2, status: "occupied" },
      { id: "r2", property_id: "22222222-2222-2222-2222-222222222222", room_number: "102", floor: "1st", bed_count: 3, status: "vacant" }
    ]
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "FORUM 1 BOYS",
    area: "koramangla",
    address: "silk board, Koramangala, sg palya, MG road, nexus",
    city: "Bangalore",
    price_range: "11k - 22k",
    is_active: true,
    food_details: "3-meals daily veg/non-veg included",
    google_maps_link: "https://maps.google.com",
    virtual_tour_link: "https://drive.google.com",
    rooms: [
      { id: "r5", property_id: "33333333-3333-3333-3333-333333333333", room_number: "101", floor: "1st", bed_count: 2, status: "occupied" },
      { id: "r6", property_id: "33333333-3333-3333-3333-333333333333", room_number: "102", floor: "1st", bed_count: 3, status: "vacant" }
    ]
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "GT GIRLS",
    area: "koramangla",
    address: "silk board, Koramangala, sg palya, MG road, nexus",
    city: "Bangalore",
    price_range: "16k - 25k",
    is_active: true,
    food_details: "3-meals delicious home-style veg",
    google_maps_link: "https://maps.google.com",
    virtual_tour_link: "https://drive.google.com",
    rooms: [
      { id: "r7", property_id: "44444444-4444-4444-4444-444444444444", room_number: "G01", floor: "Ground", bed_count: 2, status: "occupied" },
      { id: "r8", property_id: "44444444-4444-4444-4444-444444444444", room_number: "G02", floor: "Ground", bed_count: 2, status: "vacant" }
    ]
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "ESPLANADE GIRLS",
    area: "koramangla",
    address: "silk board, Koramangala, sg palya, MG road, nexus",
    city: "Bangalore",
    price_range: "21k - 41k",
    is_active: true,
    food_details: "Premium multi-cuisine buffet",
    google_maps_link: "https://maps.google.com",
    virtual_tour_link: "https://drive.google.com",
    rooms: [
      { id: "r9", property_id: "55555555-5555-5555-5555-555555555555", room_number: "101", floor: "1st", bed_count: 1, status: "occupied" },
      { id: "r10", property_id: "55555555-5555-5555-5555-555555555555", room_number: "102", floor: "1st", bed_count: 2, status: "vacant" }
    ]
  }
];

app.get("/api/pg-with-iot", async (req, res) => {
  try {
    let properties: any[] = [];
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, rooms(*)');
      
      if (!error && data && data.length > 0) {
        properties = data;
      } else {
        properties = MOCK_PROPERTIES_FALLBACK;
      }
    } catch (e) {
      properties = MOCK_PROPERTIES_FALLBACK;
    }

    const isMongoConnected = mongoose.connection.readyState === 1;

    // Combine with IoT Data (MongoDB or Mock)
    const result = await Promise.all(
      properties.map(async (pg) => {
        const roomsWithSensors = await Promise.all((pg.rooms || []).map(async (room: any, roomIdx: number) => {
          let latestSensor = null;

          if (isMongoConnected) {
            // Fetch real telemetry from MongoDB
            latestSensor = await SensorData
              .findOne({ roomId: room.id })
              .sort({ createdAt: -1 });
          }
          
          if (!latestSensor) {
            // Fallback mock telemetry if MongoDB is offline due to IP whitelist
            latestSensor = {
              temperature: parseFloat((Math.sin(Date.now() / 10000 + roomIdx) * 2 + 23).toFixed(1)),
              electricity: parseFloat((Math.cos(Date.now() / 15000 + roomIdx) * 0.5 + 1.5).toFixed(1)),
            };
          }

          return {
            ...room,
            _id: room.id,
            roomNumber: room.room_number,
            sensor: latestSensor
          };
        }));

        return {
          ...pg,
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
