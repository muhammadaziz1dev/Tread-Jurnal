const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";
const API_URL = "https://tread-jurnal.onrender.com/api/trades";

const form = document.querySelector("#tradeForm");
const tradesList = document.querySelector("#tradesList");
const searchInput = document.querySelector("#searchInput"); // HTML-ga <input id="searchInput"> qo'shing

let allTrades = []; // Filter uchun barcha tradesni saqlaymiz
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

// 1. Loading Spinner Funksiyasi
function toggleLoading(show) {
    const loader = document.getElementById("loader"); // HTML-ga <div id="loader"></div> qo'shing
    if (loader) loader.style.display = show ? "block" : "none";
}

// 2. Auto-Calculate RR (Kirish, SL, TP o'zgarganda ishlaydi)
const inputs = ['kirish', 'sl', 'tp'].map(name => document.getElementsByName(name)[0]);
inputs.forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            const entry = parseFloat(document.getElementsByName('kirish')[0].value);
            const sl = parseFloat(document.getElementsByName('sl')[0].value);
            const tp = parseFloat(document.getElementsByName('tp')[0].value);

            if (entry && sl && tp) {
                const risk = Math.abs(entry - sl);
                const reward = Math.abs(tp - entry);
                const rrValue = (reward / risk).toFixed(2);
                document.getElementsByName('rr')[0].value = `1:${rrValue}`;
            }
        });
    }
});

// 3. Ma'lumotlarni olish
async function fetchTrades() {
    toggleLoading(true);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Server xatosi");
        allTrades = await response.json();
        return allTrades;
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
    const losses = total - wins;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    const totalProfit = trades.reduce((sum, t) => sum + (Number(t.foyda) || 0), 0);
    
    const avgRR = total > 0 ? (trades.reduce((sum, t) => {
        let val = String(t.rr).includes(':') ? parseFloat(t.rr.split(':')[1]) : parseFloat(t.rr);
        return sum + (val || 0);
    }, 0) / total).toFixed(2) : 0;

    if (stats.total) stats.total.textContent = total;
    if (stats.wins) stats.wins.textContent = wins;
    if (stats.losses) stats.losses.textContent = losses;
    if (stats.winrate) stats.winrate.textContent = winrate;
    if (stats.profit) stats.profit.textContent = totalProfit.toLocaleString();
    if (stats.avgRR) stats.avgRR.textContent = avgRR;
}

// 5. Render va Filter (Qidiruv)
async function renderTrades(tradesToRender = null) {
    if (!tradesList) return;
    const trades = tradesToRender || await fetchTrades();
    tradesList.innerHTML = "";

    trades.forEach((trade) => {
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
                        $${trade.foyda || 0}
                    </div>
                </div>
                <div class="trade-actions">
                    <button class="icon-btn edit" onclick="startEdit('${trade._id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
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

// 6. Filter (Search) funksiyasi
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTrades.filter(t => 
            t.aktiv.toLowerCase().includes(term) || 
            t.natija.toLowerCase().includes(term)
        );
        renderTrades(filtered);
    });
}

// 7. Tahrirlashni boshlash (Formani to'ldirish)
window.startEdit = function(id) {
    const trade = allTrades.find(t => t._id === id);
    if (!trade) return;

    editMode = true;
    editId = id;

    // Formani to'ldirish
    Object.keys(trade).forEach(key => {
        const input = form.elements[key];
        if (input) input.value = trade[key];
    });

    form.querySelector("button[type='submit']").textContent = "Yangilash";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 8. Formani saqlash (POST yoki PUT)
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.foyda = Number(data.foyda) || 0;

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
                form.querySelector("button[type='submit']").textContent = "Saqlash";
                await renderTrades();
                alert("Muvaffaqiyatli amalga oshirildi!");
            }
        } catch (e) {
            alert("Xatolik yuz berdi!");
        }
    });
}

// 9. O'chirish
if (tradesList) {
    tradesList.addEventListener("click", async (e) => {
        const btn = e.target.closest(".delete");
        if (!btn) return;
        const id = btn.dataset.id;
        if (confirm("O'chirishni xohlaysizmi?")) {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) renderTrades();
        }
    });
}

document.addEventListener("DOMContentLoaded", renderTrades);