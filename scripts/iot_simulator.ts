import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import SensorData from "../server/models/SensorData";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function simulate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for IoT Simulation via Mongoose");

    // Fetch real rooms from Supabase to associate IoT data with
    const { data: rooms, error } = await supabase.from("rooms").select("*");
    
    if (error) {
      console.error("Failed to fetch rooms from Supabase:", error);
      return;
    }

    if (!rooms || rooms.length === 0) {
      console.log("No rooms found in Supabase. Please create properties and rooms in Supabase first.");
      return;
    }

    console.log(`Starting IoT simulation for ${rooms.length} Supabase Rooms...`);

    setInterval(async () => {
      try {
        const promises = rooms.map(async (room, index) => {
          // 1. Fetch current control state from Express
          let controlState = { ac: false, lights: true, lock: true };
          try {
            const ctrlRes = await fetch(`http://localhost:5000/api/room-control/${room.id}`);
            if (ctrlRes.ok) controlState = await ctrlRes.json();
          } catch (e) { /* fallback to default */ }

          // 2. Adjust telemetry based on controls
          let tempBase = controlState.ac ? 19 : 24;
          let elecBase = controlState.lights ? 0.8 : 0.2;
          if (controlState.ac) elecBase += 1.2;

          const data = {
            pgId: room.property_id,
            roomId: room.id,
            temperature: parseFloat((tempBase + (Math.random() * 2)).toFixed(1)),
            electricity: parseFloat((elecBase + (Math.random() * 0.4)).toFixed(1)),
            occupancy: "Unknown" 
          };

          // 3. Push to MongoDB (or log if failing)
          if (mongoose.connection.readyState === 1) {
            await SensorData.create(data);
          } else {
            // console.log(`[SIM] Room ${room.room_number}: T=${data.temperature}, E=${data.electricity} (AC:${controlState.ac})`);
          }
        });

        await Promise.all(promises);
        if (mongoose.connection.readyState === 1) {
          console.log(`[${new Date().toLocaleTimeString()}] Pushed sensor readings to MongoDB`);
        }
      } catch (err) {
        console.error("Error in simulator loop:", err);
      }
    }, 5000);


  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

simulate();
