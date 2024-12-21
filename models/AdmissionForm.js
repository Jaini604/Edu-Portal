const mongoose = require('mongoose');

const admissionFormSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

const AdmissionForm = mongoose.model('AdmissionForm', admissionFormSchema);
module.exports = AdmissionForm;
