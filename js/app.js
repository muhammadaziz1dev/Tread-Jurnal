const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";

const form = document.querySelector("form");

/* =========================
   📥 LOCALSTORAGE SAVE
   ========================= */
// Vazifasi: trade’ni browser xotirasiga saqlash
function saveTrade(data) {
    let trades = JSON.parse(localStorage.getItem("trades")) || [];
    trades.push(data);
    localStorage.setItem("trades", JSON.stringify(trades));
}

/* =========================
   📂 LOCALSTORAGE READ
   ========================= */
// Vazifasi: saqlangan trade’larni olish
function getTrades() {
    return JSON.parse(localStorage.getItem("trades")) || [];
}

/* =========================
   📦 FORM DATA COLLECTOR
   ========================= */
// Vazifasi: form inputlardan data yig‘ish
function getFormData() {
    const get = (labelText) => {
        const labels = document.querySelectorAll("label");
        for (let label of labels) {
            if (label.innerText.includes(labelText)) {
                return label.nextElementSibling.value;
            }
        }
        return "";
    };

    return {
        sana: get("Sana"),
        vaqt: get("Vaqt"),
        aktiv: get("Aktiv"),
        strategiya: get("Strategiya"),
        trend: get("Trend"),
        sabab: get("Kirish sababi"),
        balans: get("Hisob balansi"),
        kirish: get("Kirish narxi"),
        sl: get("SL"),
        tp: get("TP"),
        rr: get("Xavf/Foyda"),
        lot: get("Lot"),
        natija: get("Natija"),
        foyda: get("Foyda/Ziyon"),
        davom: get("Davomiyligi"),
        oldHiss: get("Oldingi hissiyot"),
        jarayonHiss: get("Jarayon paytidagi"),
        yakunHiss: get("Yakuniy hissiyot"),
        xato: get("Xatolar"),
        togri: get("To‘g‘ri qilingan")
    };
}

/* =========================
   🤖 TELEGRAM SEND FUNCTION
   ========================= */
// Vazifasi: message ni Telegram botga yuborish
function sendToTelegram(message) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
        })
    });
}

/* =========================
   🎯 FORM SUBMIT HANDLER
   ========================= */
form.addEventListener("submit", function(e) {
    e.preventDefault();

    // 1. Form data olish
    const data = getFormData();

    // 2. Motivatsion message
    const motivatsiya = [
        "🔥 Intizom — foydaning kaliti!",
        "💪 Har bir trade — tajriba!",
        "📈 Rejaga amal qilgan yutadi!",
        "🧠 Emotsiya emas, strategiya!",
        "🚀 Sen o‘sayapsan!"
    ];

    const randomMotiv = motivatsiya[Math.floor(Math.random() * motivatsiya.length)];

    // 3. Telegram message format
    const message = `
📊 <b>TRADING JOURNAL</b>

📅 <b>Sana:</b> ${data.sana}
⏰ <b>Vaqt:</b> ${data.vaqt}

💱 <b>Aktiv:</b> ${data.aktiv}
📌 <b>Strategiya:</b> ${data.strategiya}
📊 <b>Trend:</b> ${data.trend}

🧠 <b>Kirish sababi:</b>
${data.sabab}

💰 <b>Balans:</b> ${data.balans}
📍 <b>Kirish:</b> ${data.kirish}
🛑 <b>SL:</b> ${data.sl}
🎯 <b>TP:</b> ${data.tp}
⚖️ <b>RR:</b> ${data.rr}
📦 <b>Lot:</b> ${data.lot}

📉 <b>Natija:</b> ${data.natija}
💵 <b>Foyda/Ziyon:</b> ${data.foyda}
⏳ <b>Davomiyligi:</b> ${data.davom}

😶 <b>Oldingi hissiyot:</b>
${data.oldHiss}

😬 <b>Jarayon paytidagi:</b>
${data.jarayonHiss}

😌 <b>Yakuniy hissiyot:</b>
${data.yakunHiss}

❌ <b>Xatolar:</b>
${data.xato}

✅ <b>To‘g‘ri ishlar:</b>
${data.togri}

━━━━━━━━━━━━━━━
${randomMotiv}
`;

    // 4. Telegramga yuborish
    sendToTelegram(message);

    // 5. LocalStorage ga saqlash
    saveTrade(data);

    // 6. UX feedback
    alert("✅ Zo‘r! Telegramga yuborildi va saqlandi!");
    form.reset();
});