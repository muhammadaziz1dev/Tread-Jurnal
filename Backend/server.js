const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Sozlamalari (To'liq ruxsat bilan)
app.use(cors());
app.use(express.json());

// 2. MongoDB ulanish
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB muvaffaqiyatli ulandi'))
    .catch(err => console.error('❌ MongoDB ulanishida xato:', err.message));

// 3. Trade Schema (Mixed tipidan foydalanamiz, shunda ham son ham matn tushadi)
const tradeSchema = new mongoose.Schema({
    sana: String,
    vaqt: String,
    aktiv: String,
    strategiya: String,
    trend: String,
    balans: mongoose.Schema.Types.Mixed,
    kirish: mongoose.Schema.Types.Mixed,
    sl: mongoose.Schema.Types.Mixed,
    tp: mongoose.Schema.Types.Mixed,
    rr: mongoose.Schema.Types.Mixed,
    lot: mongoose.Schema.Types.Mixed,
    natija: String,
    foyda: mongoose.Schema.Types.Mixed,
    risk: mongoose.Schema.Types.Mixed,
    davom: String,
    sabab: String,
    oldHiss: String,
    jarayonHiss: String,
    yakunHiss: String,
    xato: String,
    togri: String
}, { timestamps: true });

const Trade = mongoose.models.Trade || mongoose.model('Trade', tradeSchema);

// 4. API Routes

app.get('/', (req, res) => {
    res.send('Trading Journal API ishlamoqda!');
});

// Yangi savdo qo'shish
app.post('/api/trades', async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        console.error("Saqlashda xato:", err);
        res.status(400).json({ message: err.message });
    }
});

// Hamma savdolarni olish
app.get('/api/trades', async (req, res) => {
    try {
        const trades = await Trade.find().sort({ createdAt: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Savdoni o'chirish
app.delete('/api/trades/:id', async (req, res) => {
    try {
        const deletedTrade = await Trade.findByIdAndDelete(req.params.id);
        if (!deletedTrade) return res.status(404).json({ message: "Savdo topilmadi" });
        res.json({ message: "Savdo o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server yondi: http://localhost:${PORT}`));