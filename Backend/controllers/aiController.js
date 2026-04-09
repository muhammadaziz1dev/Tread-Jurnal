const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Mentor tahlili uchun asosiy funksiya
 */
const analyzeTradeWithAI = async (tradeData) => {
    try {
        // .env faylingizda GEMINI_API_KEY bo'lishi shart
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Sen professional treyding mentorsan. Quyidagi treyd ma'lumotlarini tahlil qil va o'zbek tilida javob ber:
        - Aktiv: ${tradeData.pair}
        - Kirish sababi: ${tradeData.entryReason}
        - Hissiyotlar (Oldin/Jarayon/Yakun): ${tradeData.emotions}
        - Xatolar: ${tradeData.errors}
        - Natija: ${tradeData.result} (${tradeData.profit}$)

        Iltimos, treyderga qisqa va lo'nda qilib:
        1. Psixologik holatiga baxo ber.
        2. Strategiyadagi xatoni ko'rsat.
        3. Keyingi safar uchun 1 ta asosiy maslahat ber.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // AI dan kelgan toza matnni qaytaramiz
        return response.text(); 

    } catch (error) {
        console.error("AI Mentor Error:", error);
        return "AI tahlili tayyorlashda texnik xatolik yuz berdi.";
    }
};

// Funksiyani boshqa fayllarda (tradeController.js) ishlatish uchun eksport qilamiz
module.exports = { analyzeTradeWithAI };