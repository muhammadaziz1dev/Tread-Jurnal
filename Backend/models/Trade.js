const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sana: { type: String, required: true },
    vaqt: { type: String },
    aktiv: { type: String, required: true },
    strategiya: { type: String },
    trend: { type: String },
    balans: { type: Number },
    kirish: { type: Number },
    sl: { type: Number },
    tp: { type: Number },
    rr: { type: String },
    lot: { type: Number },
    natija: { type: String, enum: ['win', 'loss'], required: true },
    foyda: { type: Number, required: true },
    risk: { type: Number },
    davom: { type: String },
    sabab: { type: String },
    
    // Hissiyotlar va tahlillar
    oldHiss: { type: String },
    jarayonHiss: { type: String },
    yakunHiss: { type: String },
    xato: { type: String },
    togri: { type: String },
    
    // --- AI TAHLILI UCHUN JOY ---
    aiFeedback: { 
        type: String, 
        default: "" 
    }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);