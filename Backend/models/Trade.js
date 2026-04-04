const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
    pair: { type: String, required: true },    // masalan: XAUUSD
    type: { type: String, required: true },    // Buy yoki Sell
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    status: { type: String, default: 'Pending' }, // Win, Loss, Pending
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', TradeSchema);