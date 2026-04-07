const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    // Foydalanuvchini bog'lash (Eng muhim qator!)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Sizning server.js dagi barcha maydonlaringiz:
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
}, { timestamps: true }); // yaratilgan vaqtini avtomatik saqlaydi

module.exports = mongoose.model('Trade', tradeSchema);