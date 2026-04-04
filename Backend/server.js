const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Sozlamalari (Netlify ruxsati bilan)
const corsOptions = {
    origin: '*', // Hozircha hamma joydan ruxsat beramiz (Netlify va Localhost uchun)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json()); // MUHIM: Bu cors dan keyin turishi kerak

// 2. MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB muvaffaqiyatli ulandi'))
    .catch(err => console.error('❌ MongoDB ulanishida xato:', err));

// 3. Trade Schema & Model
const tradeSchema = new mongoose.Schema({
    sana: String,
    vaqt: String,
    aktiv: String,
    strategiya: String,
    trend: String,
    balans: String,
    kirish: String,
    sl: String,
    tp: String,
    rr: String,
    lot: String,
    natija: String,
    foyda: String,
    risk: String,
    davom: String,
    sabab: String,
    oldHiss: String,
    jarayonHiss: String,
    yakunHiss: String,
    xato: String,
    togri: String
}, { timestamps: true });

// Modelni faqat bir marta yaratish (Error oldini olish uchun)
const Trade = mongoose.models.Trade || mongoose.model('Trade', tradeSchema);

// 4. API Routes

// Test yo'li
app.get('/', (req, res) => {
    res.send('Trading Journal API ishga tushdi! CORS sozlangan.');
});

// Yangi savdo qo'shish (POST)
app.post('/api/trades', async (req, res) => {
    try {
        console.log("Kelgan ma'lumot:", req.body); // Debug uchun
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        console.error("Saqlashda xato:", err);
        res.status(400).json({ message: err.message });
    }
});

// Hamma savdolarni olish (GET)
app.get('/api/trades', async (req, res) => {
    try {
        const trades = await Trade.find().sort({ createdAt: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Savdoni o'chirish (DELETE)
app.delete('/api/trades/:id', async (req, res) => {
    try {
        const deletedTrade = await Trade.findByIdAndDelete(req.params.id);
        if (!deletedTrade) {
            return res.status(404).json({ message: "Savdo topilmadi" });
        }
        res.json({ message: "Savdo o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Serverni yondirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server yondi: http://localhost:${PORT}`);
});