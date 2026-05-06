import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  pgId: {
    type: String, // Storing Supabase UUID
    required: true
  },
  roomId: {
    type: String, // Storing Supabase UUID
    required: true
  },
  temperature: Number,
  electricity: Number,
  occupancy: String,
  createdAt: { type: Date, default: Date.now }
});

const SensorData = mongoose.models.SensorData || mongoose.model("SensorData", sensorSchema);
export default SensorData;
