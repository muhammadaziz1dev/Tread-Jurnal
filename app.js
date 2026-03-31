const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";

const form = document.querySelector("form");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const get = (labelText) => {
        const labels = document.querySelectorAll("label");
        for (let label of labels) {
            if (label.innerText.includes(labelText)) {
                return label.nextElementSibling.value;
            }
        }
        return "";
    };

    const sana = get("Sana");
    const vaqt = get("Vaqt");
    const aktiv = get("Aktiv");
    const strategiya = get("Strategiya");
    const trend = get("Trend");
    const sabab = get("Kirish sababi");
    const balans = get("Hisob balansi");
    const kirish = get("Kirish narxi");
    const sl = get("SL");
    const tp = get("TP");
    const rr = get("Xavf/Foyda");
    const lot = get("Lot");
    const natija = get("Natija");
    const foyda = get("Foyda/Ziyon");
    const davom = get("Davomiyligi");
    const oldHiss = get("Oldingi hissiyot");
    const jarayonHiss = get("Jarayon paytidagi");
    const yakunHiss = get("Yakuniy hissiyot");
    const xato = get("Xatolar");
    const togri = get("To‘g‘ri qilingan");

    // Motivatsion gaplar
    const motivatsiya = [
        "🔥 Intizom — foydaning kaliti!",
        "💪 Har bir trade — tajriba!",
        "📈 Rejaga amal qilgan yutadi!",
        "🧠 Emotsiya emas, strategiya!",
        "🚀 Sen o‘sayapsan!"
    ];

    const randomMotiv = motivatsiya[Math.floor(Math.random() * motivatsiya.length)];

    const message = `
📊 <b>TRADING JOURNAL</b>

📅 <b>Sana:</b> ${sana}
⏰ <b>Vaqt:</b> ${vaqt}

💱 <b>Aktiv:</b> ${aktiv}
📌 <b>Strategiya:</b> ${strategiya}
📊 <b>Trend:</b> ${trend}

🧠 <b>Kirish sababi:</b>
${sabab}

💰 <b>Balans:</b> ${balans}
📍 <b>Kirish:</b> ${kirish}
🛑 <b>SL:</b> ${sl}
🎯 <b>TP:</b> ${tp}
⚖️ <b>RR:</b> ${rr}
📦 <b>Lot:</b> ${lot}

📉 <b>Natija:</b> ${natija}
💵 <b>Foyda/Ziyon:</b> ${foyda}
⏳ <b>Davomiyligi:</b> ${davom}

😶 <b>Oldingi hissiyot:</b>
${oldHiss}

😬 <b>Jarayon paytidagi:</b>
${jarayonHiss}

😌 <b>Yakuniy hissiyot:</b>
${yakunHiss}

❌ <b>Xatolar:</b>
${xato}

✅ <b>To‘g‘ri ishlar:</b>
${togri}

━━━━━━━━━━━━━━━
${randomMotiv}
`;

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
    })
    .then(() => {
        alert("✅ Zo‘r! Telegramga yuborildi!");
        form.reset();
    })
    .catch(() => {
        alert("❌ Xatolik yuz berdi");
    });
});