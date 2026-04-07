const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json()); // Kelayotgan JSON ma'lumotlarni o'qish uchun shart!

// 2. MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB muvaffaqiyatli ulandi'))
    .catch(err => console.error('❌ MongoDB ulanishida xato:', err.message));

// 3. API Routes (Yo'nalishlarni ulash)
// Auth (Login/Register) yo'nalishi
app.use('/api/auth', require('./routes/auth'));

// Trades (Savdolar) yo'nalishi
app.use('/api/trades', require('./routes/trades'));

// Asosiy sahifa testi
app.get('/', (req, res) => {
    res.send('Trading Journal API ishlamoqda! 🚀');
});

// 4. Port sozlamasi (Render uchun)
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => console.log(`🚀 Server yondi: port ${PORT}`));