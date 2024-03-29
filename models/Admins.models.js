const mongoose = require('mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
});


const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
