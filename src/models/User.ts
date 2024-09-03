import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // tbc
  // isReady: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model('User', userSchema); 

export default User;