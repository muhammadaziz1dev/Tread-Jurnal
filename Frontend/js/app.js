const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";
const API_URL = "https://tread-jurnal.onrender.com/api/trades";

const form = document.querySelector("#tradeForm");
const tradesList = document.querySelector("#tradesList");

const stats = {
    total: document.getElementById("totalTrades"),
    wins: document.getElementById("wins"),
    losses: document.getElementById("losses"),
    winrate: document.getElementById("winrate"),
    profit: document.getElementById("totalProfit"),
    avgRR: document.getElementById("avgRR")
};

// 1. Ma'lumotlarni serverdan olish
async function fetchTrades() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Serverdan ma'lumot olishda xato");
        return await response.json();
    } catch (e) {
        console.error("Xatolik:", e);
        return [];
    }
}

// 2. Dashboardni yangilash
function updateDashboard(trades) {
    const total = trades.length;
    const wins = trades.filter(t => String(t.natija).toLowerCase() === "win").length;
    const losses = total - wins;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    const totalProfit = trades.reduce((sum, t) => sum + (Number(t.foyda) || 0), 0);
    
    // RR formatini tekshirish (agar "1:2" ko'rinishida bo'lsa, son qismini ajratib olish)
    const avgRR = total > 0 ? (trades.reduce((sum, t) => {
        const rrVal = String(t.rr).includes(':') ? parseFloat(t.rr.split(':')[1]) : parseFloat(t.rr);
        return sum + (rrVal || 0);
    }, 0) / total).toFixed(2) : 0;

    if (stats.total) stats.total.textContent = total;
    if (stats.wins) stats.wins.textContent = wins;
    if (stats.losses) stats.losses.textContent = losses;
    if (stats.winrate) stats.winrate.textContent = winrate;
    if (stats.profit) stats.profit.textContent = totalProfit.toLocaleString();
    if (stats.avgRR) stats.avgRR.textContent = avgRR;
}

// 3. Savdolarni ekranga chiqarish
async function renderTrades() {
    if (!tradesList) return;
    const trades = await fetchTrades();
    tradesList.innerHTML = "";

    [...trades].reverse().forEach((trade) => {
        const card = document.createElement("div");
        card.className = "trade-card";
        
        const isWin = String(trade.natija).toLowerCase() === 'win';
        const profitColor = parseFloat(trade.foyda) >= 0 ? '#00c805' : '#ff3b30';

        card.innerHTML = `
            <div class="trade-card-content">
                <div class="trade-info-list">
                    <div class="info-item"><i class="fa-regular fa-calendar"></i> ${trade.sana || '---'}</div>
                    <div class="info-item"><b>${trade.aktiv || 'No Pair'}</b></div>
                    <div class="info-item ${isWin ? 'status-tp' : 'status-sl'}">
                        <i class="fa-solid ${isWin ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> 
                        ${(trade.natija || '---').toUpperCase()}
                    </div>
                    <div class="info-item profit-val" style="color: ${profitColor}">
                        <i class="fa-solid fa-money-bill-1"></i> ${trade.foyda || 0} USD
                    </div>
                </div>
                <div class="trade-actions">
                    <button class="icon-btn delete" data-id="${trade._id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        tradesList.appendChild(card);
    });
    updateDashboard(trades);
}

// 4. Telegramga yuborish
async function sendToTelegram(data) {
    const message = `📊 <b>Yangi Trade Saqlandi</b>\n` +
        `──────────────────\n` +
        `📅 <b>Sana:</b> ${data.sana}\n` +
        `💱 <b>Aktiv:</b> ${data.aktiv}\n` +
        `🎯 <b>Natija:</b> ${data.natija.toUpperCase()}\n` +
        `💵 <b>Foyda:</b> ${data.foyda} USD\n` +
        `──────────────────`;
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
        });
    } catch (e) { console.error("Telegram Error:", e); }
}

// 5. Formani saqlash
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());

        // Raqamli maydonlarni Number turiga o'tkazish (Serverdagi 400 xatosini oldini oladi)
        const data = {
            ...rawData,
            foyda: Number(rawData.foyda) || 0,
            balans: Number(rawData.balans) || 0,
            kirish: Number(rawData.kirish) || 0,
            sl: Number(rawData.sl) || 0,
            tp: Number(rawData.tp) || 0,
            lot: Number(rawData.lot) || 0,
            risk: Number(rawData.risk) || 0
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                await sendToTelegram(data);
                await renderTrades();
                form.reset();
                alert("Savdo muvaffaqiyatli saqlandi!");
            } else {
                const errorInfo = await response.text();
                console.error("Server javobi:", errorInfo);
                alert("Server ma'lumotni qabul qilmadi. Logs bo'limini tekshiring.");
            }
        } catch (e) {
            console.error("Saqlashda xato:", e);
            alert("Internet yoki Server bilan aloqa uzildi!");
        }
    });
}

// 6. O'chirish funksiyasi
if (tradesList) {
    tradesList.addEventListener("click", async (e) => {
        const btn = e.target.closest(".delete");
        if (!btn) return;

        const id = btn.dataset.id;
        if (confirm("Ushbu savdoni o'chirishga aminmisiz?")) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                if (response.ok) {
                    await renderTrades();
                } else {
                    alert("O'chirishda server xatosi yuz berdi.");
                }
            } catch (e) { console.error("O'chirishda xato:", e); }
        }
    });
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", renderTrades);