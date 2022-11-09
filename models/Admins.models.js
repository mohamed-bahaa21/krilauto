const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
});


const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
