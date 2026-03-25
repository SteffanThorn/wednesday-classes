import mongoose from 'mongoose';

const classAttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userName: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: true,
  },
  classDate: {
    type: Date,
    required: true,
  },
  classTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  status: {
    type: String,
    enum: ['attended', 'no-show'],
    default: 'attended',
  },
  usedCredit: {
    type: Boolean,
    default: false,
  },
  markedByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  markedByAdminEmail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

classAttendanceSchema.index({ classDate: 1, classTime: 1 });
classAttendanceSchema.index({ userEmail: 1, classDate: 1, classTime: 1 }, { unique: true });

const ClassAttendance = mongoose.models.ClassAttendance || mongoose.model('ClassAttendance', classAttendanceSchema);

export default ClassAttendance;
