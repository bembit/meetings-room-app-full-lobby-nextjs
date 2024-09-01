import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  side1: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }, // Initialize as empty array
  side2: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }, // Initialize as empty array
  // side1: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // side2: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;