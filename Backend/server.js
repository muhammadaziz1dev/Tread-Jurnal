const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();

// Ma'lumotlarni JSON formatda qabul qilish va CORS ruxsati
app.use(cors());
app.use(express.json());

// MongoDB ulanish (Hozircha lokal bazaga)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB muvaffaqiyatli ulandi'))
    .catch(err => console.error('❌ Bazada xato:', err));

// Test uchun yo'l (Route)
app.get('/', (req, res) => {
    res.send('Trading Journal API ishga tushdi!');
});

const Trade = require('./models/Trade'); // Boya yaratgan modelimiz

// Yangi savdo qo'shish API (POST)
app.post('/api/trades', async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Hamma savdolarni olish API (GET)
app.get('/api/trades', async (req, res) => {
    try {
        const trades = await Trade.find().sort({ date: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} manzilida yondi`);
});

// O'chirish API
app.delete('/api/trades/:id', async (req, res) => {
    try {
        await Trade.findByIdAndDelete(req.params.id);
        res.json({ message: "Savdo o'chirildi" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Ma'lumotlarni JSON formatida qabul qilish uchun (shart!)
app.use(express.json()); 

// Trade Schema (Validation xatolarini oldini olish uchun hamma maydonni String qilamiz)
const tradeSchema = new mongoose.Schema({
    sana: String, vaqt: String, aktiv: String, strategiya: String,
    trend: String, balans: String, kirish: String, sl: String,
    tp: String, rr: String, lot: String, natija: String,
    foyda: String, risk: String, davom: String, sabab: String,
    oldHiss: String, jarayonHiss: String, yakunHiss: String,
    xato: String, togri: String
});

const Trade = mongoose.model('Trade', tradeSchema);

// POST yo'nalishi
app.post('/api/trades', async (req, res) => {
    try {
        const newTrade = new Trade(req.body);
        await newTrade.save();
        
        // Telegramga yuborish qismi (ixtiyoriy, agar bot sozlangan bo'lsa)
        res.status(201).json(newTrade);
    } catch (error) {
        console.error("Serverda xato:", error);
        res.status(400).json({ message: error.message });
    }
});