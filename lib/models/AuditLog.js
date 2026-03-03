import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Log type is required'],
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin ID is required'],
  },
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required'],
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  details: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// helpful indexes for querying
auditLogSchema.index({ type: 1, adminId: 1, bookingId: 1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
