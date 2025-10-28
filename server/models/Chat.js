const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentBlockSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['text', 'code', 'image', 'video', 'table']
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { _id: false }); // <--- Good: Disables _id for ContentBlock

const MessageSchema = new Schema({ 
    // You'll need to send the UUID from the frontend in your message object, 
    // but we'll prevent Mongoose from trying to cast it to ObjectId.
    sender: {
        type: String,
        required: true,
        enum: ['user', 'ai']
    },
    content: [ContentBlockSchema]
}, { 
    timestamps: true,
    _id: false // <--- 💡 SOLUTION: Disable _id generation/casting for MessageSchema
});

const ChatSchema = new Schema({
    _id: {
        type: String, // Chat _id is correctly defined as String (UUID)
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    messages: [MessageSchema]
}, { 
    timestamps: true,
    versionKey: false 
});

module.exports = mongoose.model('Chat', ChatSchema);