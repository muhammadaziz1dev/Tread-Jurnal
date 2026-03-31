const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";

const form = document.querySelector("form");
const tradesList = document.getElementById("tradesList");

/* =========================
   LOCAL STORAGE
   ========================= */

function getTrades() {
    return JSON.parse(localStorage.getItem("trades")) || [];
}

function saveTrades(trades) {
    localStorage.setItem("trades", JSON.stringify(trades));
}

/* =========================
   FORM DATA
   ========================= */

function getFormData() {
    const formData = new FormData(form);

    return Object.fromEntries(formData.entries());
}

/* =========================
   TELEGRAM
   ========================= */

function sendToTelegram(message) {
    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
        })
    });
}

/* =========================
   RENDER
   ========================= */

function renderTrades() {
    const trades = getTrades();
    tradesList.innerHTML = "";

    trades.forEach((trade, index) => {
        const div = document.createElement("div");
        div.classList.add("trade-card");

        div.innerHTML = `
            <p>📅 ${trade.sana}</p>
            <p>💱 ${trade.aktiv}</p>
            <p>📉 ${trade.natija}</p>
            <p>💵 ${trade.foyda}</p>

            <button onclick="deleteTrade(${index})">❌ Delete</button>
            <button onclick="editTrade(${index})">✏️ Edit</button>
        `;

        tradesList.appendChild(div);
    });
}

/* =========================
   DELETE
   ========================= */

function deleteTrade(index) {
    let trades = getTrades();
    trades.splice(index, 1);
    saveTrades(trades);
    renderTrades();
}

/* =========================
   EDIT
   ========================= */

function editTrade(index) {
    let trades = getTrades();
    let trade = trades[index];

    Object.keys(trade).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = trade[key];
    });

    deleteTrade(index);
}

/* =========================
   SUBMIT
   ========================= */

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const data = getFormData();

    const message = `
📊 <b>TRADING JOURNAL</b>

📅 Sana: ${data.sana}
⏰ Vaqt: ${data.vaqt}
💱 Aktiv: ${data.aktiv}
📉 Natija: ${data.natija}
💵 Foyda: ${data.foyda}
`;

    sendToTelegram(message);

    let trades = getTrades();
    trades.push(data);
    saveTrades(trades);

    renderTrades();

    alert("✅ Saved!");
    form.reset();
});

/* INIT */
document.addEventListener("DOMContentLoaded", renderTrades);