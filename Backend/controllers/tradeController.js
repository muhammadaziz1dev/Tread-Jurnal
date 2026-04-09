const Trade = require('../models/Trade');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini AI ni sozlash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. AI MENTOR FUNKSIYASI (Yordamchi funksiya) ---
async function getAITradeMentorship(tradeData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Sen professional Trading Mentorsan. Quyidagi treyd ma'lumotlarini tahlil qil va faqat o'zbek tilida javob ber:
            
            Aktiv: ${tradeData.asset}
            Trend: ${tradeData.trend}
            Kirish sababi: ${tradeData.entryReason}
            Hissiyotlar: ${tradeData.emotions}
            Xatolar: ${tradeData.errors}
            Natija: ${tradeData.result} (${tradeData.profit}$)

            Vazifang:
            1. Treyderning psixologik holatiga (hissiyotlariga) qisqa baxo ber.
            2. Kirish sababi va xatolarini solishtirib, mantiqiy xatoni top.
            3. Keyingi treyd uchun bitta oltin qoida ber.
            Javobing qisqa va lo'nda bo'lsin.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("AI Error:", err);
        return "AI tahlili hozircha mavjud emas (API bilan bog'lanishda xatolik).";
    }
}

// --- 2. BARCHA TREYDLARNI OLISH ---
exports.getTrades = async (req, res) => {
    try {
        // Faqat shu foydalanuvchiga tegishli treydlarni olish
        const trades = await Trade.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// // --- 3. YANGI TREYD QO'SHISH (AI BILAN) ---
// exports.createTrade = async (req, res) => {
//     try {
//         // AI ga yuborish uchun ma'lumotlarni tayyorlash
//         const tradeDataForAI = {
//             asset: req.body.aktiv,
//             trend: req.body.trend,
//             entryReason: req.body.sabab,
//             emotions: `${req.body.oldHiss || ''}, ${req.body.jarayonHiss || ''}, ${req.body.yakunHiss || ''}`,
//             errors: req.body.xato,
//             result: req.body.natija,
//             profit: req.body.foyda
//         };

//         // AI Mentor tahlilini olish
//         const aiFeedback = await getAITradeMentorship(tradeDataForAI);

//         // Bazaga saqlash
//         const newTrade = new Trade({
//             ...req.body,
//             aiFeedback: aiFeedback, // AI javobini qo'shamiz
//             userId: req.user.id     // Foydalanuvchi ID sini bog'laymiz
//         });

//         const savedTrade = await newTrade.save();
//         res.status(201).json(savedTrade);
//     } catch (err) {
//         console.error("Saqlashda xatolik:", err);
//         res.status(400).json({ message: err.message });
//     }
// };
exports.createTrade = async (req, res) => {
    try {
        console.log("Frontenddan kelgan ma'lumot:", req.body); // <-- Buni qo'shing

        const tradeDataForAI = {
            asset: req.body.aktiv,
            trend: req.body.trend,
            entryReason: req.body.sabab,
            emotions: `${req.body.oldHiss || ''}, ${req.body.jarayonHiss || ''}, ${req.body.yakunHiss || ''}`,
            errors: req.body.xato,
            result: req.body.natija,
            profit: req.body.foyda
        };

        console.log("AI-ga ketayotgan tayyor ma'lumot:", tradeDataForAI); // <-- Buni ham

        const aiFeedback = await getAITradeMentorship(tradeDataForAI);
        console.log("AI-dan kelgan javob:", aiFeedback); // <-- Va buni

        const newTrade = new Trade({
            ...req.body,
            aiFeedback: aiFeedback,
            userId: req.user.id
        });

        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        console.error("Saqlashda xatolik:", err);
        res.status(400).json({ message: err.message });
    }
};

// --- 4. TREYDNI TAHRIRLASH ---
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

// --- 5. TREYDNI O'CHIRISH ---
exports.deleteTrade = async (req, res) => {
    try {
        const deletedTrade = await Trade.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        if (!deletedTrade) return res.status(404).json({ message: "Savdo topilmadi" });
        res.json({ message: "Savdo o'chirildi ✅" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};