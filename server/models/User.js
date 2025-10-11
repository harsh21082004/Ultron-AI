const mongoose = require('mongoose');

const schema = mongoose.Schema;

const User = new schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePic: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', User);