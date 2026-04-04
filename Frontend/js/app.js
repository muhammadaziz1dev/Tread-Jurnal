const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";
const API_URL = "https://tread-jurnal.onrender.com/api/trades";

const form = document.querySelector("#tradeForm");
const tradesList = document.querySelector("#tradesList");
const searchInput = document.getElementById("searchInput");
const loader = document.getElementById("loader");

let allTrades = []; 
let editMode = false;
let editId = null;

const stats = {
    total: document.getElementById("totalTrades"),
    wins: document.getElementById("wins"),
    losses: document.getElementById("losses"),
    winrate: document.getElementById("winrate"),
    profit: document.getElementById("totalProfit"),
    avgRR: document.getElementById("avgRR")
};

// 1. Loading Spinnerni boshqarish
function toggleLoading(show) {
    if (loader) loader.style.display = show ? "block" : "none";
}

// 2. Auto-Calculate RR (Kirish, SL, TP o'zgarganda)
const inputsRR = ['kirish', 'sl', 'tp'].map(name => document.getElementsByName(name)[0]);
inputsRR.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            const entry = parseFloat(document.getElementsByName('kirish')[0].value);
            const sl = parseFloat(document.getElementsByName('sl')[0].value);
            const tp = parseFloat(document.getElementsByName('tp')[0].value);

            if (entry && sl && tp) {
                const risk = Math.abs(entry - sl);
                const reward = Math.abs(tp - entry);
                if (risk !== 0) {
                    const rrValue = (reward / risk).toFixed(2);
                    document.getElementsByName('rr')[0].value = `1:${rrValue}`;
                }
            }
        });
    }
});

// 3. Ma'lumotlarni serverdan olish
async function fetchTrades() {
    toggleLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Server xatosi");
        allTrades = await response.json();
        return Array.isArray(allTrades) ? allTrades : [];
    } catch (e) {
        console.error("Xatolik:", e);
        return [];
    } finally {
        toggleLoading(false);
    }
}

// 4. Dashboardni yangilash
function updateDashboard(trades) {
    const total = trades.length;
    const wins = trades.filter(t => String(t.natija).toLowerCase() === "win").length;
    const losses = trades.filter(t => String(t.natija).toLowerCase() === "loss").length;
    const totalProfit = trades.reduce((sum, t) => sum + (parseFloat(t.foyda) || 0), 0);
    
    const avgRR = total > 0 ? (trades.reduce((sum, t) => {
        let val = String(t.rr).includes(':') ? parseFloat(t.rr.split(':')[1]) : parseFloat(t.rr);
        return sum + (val || 0);
    }, 0) / total).toFixed(2) : 0;

    if (stats.total) stats.total.textContent = total;
    if (stats.wins) stats.wins.textContent = wins;
    if (stats.losses) stats.losses.textContent = losses;
    if (stats.winrate) stats.winrate.textContent = total ? ((wins / total) * 100).toFixed(1) : 0;
    if (stats.profit) stats.profit.textContent = totalProfit.toLocaleString();
    if (stats.avgRR) stats.avgRR.textContent = avgRR;
}

// 5. Render (Savdolarni ko'rsatish)
async function renderTrades(tradesToRender = null) {
    if (!tradesList) return;
    const trades = tradesToRender !== null ? tradesToRender : await fetchTrades();
    tradesList.innerHTML = "";

    if (trades.length === 0) {
        tradesList.innerHTML = "<p style='text-align:center; padding:20px;'>Ma'lumot topilmadi.</p>";
        updateDashboard(tradesToRender !== null ? tradesToRender : []);
        return;
    }

    trades.forEach((trade) => {
        const card = document.createElement("div");
        card.className = `trade-card ${trade.natija}`;
        const isWin = String(trade.natija).toLowerCase() === 'win';

        card.innerHTML = `
            <div class="trade-card-content">
                <div class="trade-info-list">
                    <div class="info-item"><i class="fa-regular fa-calendar"></i> ${trade.sana || '---'}</div>
                    <div class="info-item"><b>${trade.aktiv || '---'}</b></div>
                    <div class="info-item ${isWin ? 'status-tp' : 'status-sl'}">
                        <i class="fa-solid ${isWin ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> 
                        ${(trade.natija || '---').toUpperCase()}
                    </div>
                    <div class="info-item profit-val" style="color: ${parseFloat(trade.foyda) >= 0 ? '#00c805' : '#ff3b30'}">
                        <b>${trade.foyda || 0} USD</b>
                    </div>
                </div>
                <div class="trade-actions">
                    <button class="icon-btn edit" onclick="startEdit('${trade._id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteTrade('${trade._id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        tradesList.appendChild(card);
    });
    
    if (tradesToRender === null) updateDashboard(allTrades);
}

// 6. Search (Qidiruv) funksiyasi
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTrades.filter(t => 
            (t.aktiv && t.aktiv.toLowerCase().includes(term)) || 
            (t.natija && t.natija.toLowerCase().includes(term))
        );
        renderTrades(filtered);
    });
}

// 7. Telegramga yuborish
async function sendToTelegram(data) {
    const message = `📊 <b>Yangi Trade</b>\n💱 Aktiv: ${data.aktiv}\n🎯 Strategiya: ${data.strategiya || '---'}\n📈 Natija: ${data.natija.toUpperCase()}\n💵 Foyda: ${data.foyda} USD`;
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
        });
    } catch (e) { console.error("Telegram xatosi:", e); }
}

// 8. Tahrirlashni boshlash (Formani to'ldirish)
window.startEdit = function(id) {
    const trade = allTrades.find(t => t._id === id);
    if (!trade) return;

    editMode = true;
    editId = id;

    // Formadagi barcha inputlarni trade ma'lumotlari bilan to'ldirish
    Object.keys(trade).forEach(key => {
        const input = form.elements[key];
        if (input) input.value = trade[key];
    });

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.innerHTML = 'Yangilash <i class="fa-solid fa-rotate"></i>';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 9. Formani saqlash (POST yoki PUT)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `${API_URL}/${editId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            if (!editMode) await sendToTelegram(data);
            
            editMode = false;
            editId = null;
            form.reset();
            
            const submitBtn = document.getElementById("submitBtn");
            if (submitBtn) submitBtn.innerHTML = 'Saqlash <i class="fa-solid fa-floppy-disk"></i>';
            
            await renderTrades();
            alert("Amal muvaffaqiyatli bajarildi! ✅");
        }
    } catch (e) {
        alert("Xatolik yuz berdi!");
    }
});

// 10. O'chirish
window.deleteTrade = async function(id) {
    if (!confirm("Haqiqatdan ham ushbu savdoni o'chirmoqchimisiz?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
            await renderTrades();
        }
    } catch (e) {
        console.error("O'chirishda xato:", e);
    }
};

// Sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", renderTrades);