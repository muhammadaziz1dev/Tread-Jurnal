const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";

// DOM elementlarini tanlash
const form = document.querySelector("#tradeForm");
const tradesList = document.querySelector("#tradesList");

// Dashboard elementlari
const stats = {
    total: document.getElementById("totalTrades"),
    wins: document.getElementById("wins"),
    losses: document.getElementById("losses"),
    winrate: document.getElementById("winrate"),
    profit: document.getElementById("totalProfit"),
    avgRR: document.getElementById("avgRR")
};

/* =========================
   STORAGE & LOGIC
   ========================= */
const getTrades = () => JSON.parse(localStorage.getItem("trades")) || [];
const saveTrades = (trades) => localStorage.setItem("trades", JSON.stringify(trades));

function updateDashboard() {
    const trades = getTrades();
    const total = trades.length;
    const wins = trades.filter(t => t.natija === "win").length;
    const losses = total - wins;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    const totalProfit = trades.reduce((sum, t) => sum + (Number(t.foyda) || 0), 0);
    const avgRR = total > 0 ? (trades.reduce((sum, t) => sum + (parseFloat(t.rr) || 0), 0) / total).toFixed(2) : 0;

    if (stats.total) stats.total.textContent = total;
    if (stats.wins) stats.wins.textContent = wins;
    if (stats.losses) stats.losses.textContent = losses;
    if (stats.winrate) stats.winrate.textContent = winrate;
    if (stats.profit) stats.profit.textContent = totalProfit;
    if (stats.avgRR) stats.avgRR.textContent = avgRR;
}

/* =========================
   TELEGRAM SEND
   ========================= */
async function sendToTelegram(data) {
    const message = `
📊 <b>Yangi Trade Saqlandi</b>
──────────────────
📅 <b>Sana:</b> ${data.sana}
💱 <b>Aktiv:</b> ${data.aktiv}
🎯 <b>Strategiya:</b> ${data.strategiya}
📈 <b>Natija:</b> ${data.natija.toUpperCase()}
💵 <b>Foyda:</b> ${data.foyda} USD
──────────────────
    `;

    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
        });
    } catch (e) { console.error("Telegram Error:", e); }
}

/* =========================
   RENDER TRADES
   ========================= */
function renderTrades() {
    if (!tradesList) return;
    const trades = getTrades();
    tradesList.innerHTML = "";

    trades.forEach((trade, index) => {
        const card = document.createElement("div");
        card.className = "trade-card";
        card.style.marginBottom = "15px";

        card.innerHTML = `
            <div class="trade-card-content">
                <div class="trade-info-list">
                    <div class="info-item"><i class="fa-regular fa-calendar"></i> ${trade.sana}</div>
                    <div class="info-item"><b>${trade.aktiv}</b></div>
                    <div class="info-item ${trade.natija === 'win' ? 'status-tp' : 'status-sl'}">
                        <i class="fa-solid fa-bullseye"></i> ${trade.natija.toUpperCase()}
                    </div>
                    <div class="info-item profit-val" style="color: ${trade.foyda >= 0 ? '#00c805' : '#ff3b30'}">
                        <i class="fa-solid fa-money-bill-1"></i> ${trade.foyda} USD
                    </div>
                </div>
                <div class="trade-actions">
                    <button class="icon-btn edit" data-index="${index}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="icon-btn delete" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
        tradesList.appendChild(card);
    });
    updateDashboard();
}

/* =========================
   EVENTS
   ========================= */

// Submit Form
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const trades = getTrades();
    trades.unshift(data);
    saveTrades(trades);
    
    sendToTelegram(data);
    renderTrades();
    form.reset();
});

// Click Actions (Delete/Edit)
tradesList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const index = btn.dataset.index;
    const trades = getTrades();

    if (btn.classList.contains("delete")) {
        if (confirm("O'chirilsinmi?")) {
            trades.splice(index, 1);
            saveTrades(trades);
            renderTrades();
        }
    }

    if (btn.classList.contains("edit")) {
        const trade = trades[index];
        Object.keys(trade).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = trade[key];
        });
        trades.splice(index, 1);
        saveTrades(trades);
        renderTrades();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Initial Load
document.addEventListener("DOMContentLoaded", renderTrades);