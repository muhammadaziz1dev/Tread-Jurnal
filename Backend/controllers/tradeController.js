const Trade = require('../models/Trade');

// 1. Faqat tizimga kirgan foydalanuvchining savdolarini olish
exports.getTrades = async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Yangi savdo qo'shish (Foydalanuvchi ID-si bilan birga)
exports.createTrade = async (req, res) => {
    try {
        const newTrade = new Trade({
            ...req.body,
            userId: req.user.id // Token ichidan olingan ID
        });
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 3. Savdoni tahrirlash (Faqat o'zinikini)
exports.updateTrade = async (req, res) => {
    try {
        const updatedTrade = await Trade.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!updatedTrade) return res.status(404).json({ message: "Savdo topilmadi" });
        res.json(updatedTrade);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 4. Savdoni o'chirish
exports.deleteTrade = async (req, res) => {
    try {
        const deletedTrade = await Trade.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedTrade) return res.status(404).json({ message: "Savdo topilmadi" });
        res.json({ message: "Savdo o'chirildi ✅" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};