import { create } from "domain";
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  side1: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }, // Initialize as empty array
  side2: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] }, // Initialize as empty array

  readyParticipants: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    isReady: { type: Boolean, default: false } 
  }],
  inviteCode: { type: String, unique: true },

  createdAt: { type: Date, default: Date.now },
  isStarted: { type: Boolean, default: false },

  // kicked users. timeout 30sec.
  kickedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  // banned users. banned until meeting ends. default is empty array
  bannedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;