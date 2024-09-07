import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // maybe one day
  // friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // invitedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // track users if they are members of any existing room so we can block them joining or creating multiple rooms
  isCurrentlyInRoom: { type: Boolean, default: false },
  currentRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
});

const User = mongoose.models.User || mongoose.model('User', userSchema); 

export default User;