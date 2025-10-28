const express = require('express');
const { saveChat, getAllChats, getChatById } = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/save', protect, saveChat);
router.get('/all', getAllChats);
router.get('/get/:chatId', protect, getChatById);

module.exports = router;