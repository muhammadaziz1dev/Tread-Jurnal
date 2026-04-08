const TOKEN = "8739866680:AAFwClNNNtv9Cgs36K5fHA_sz6LrtZvb3mQ";
const CHAT_ID = "8101060085";
const API_URL = "https://tread-jurnal.onrender.com/api/trades";
// app.js faylida:
// const API_URL = "http://localhost:5000/api/trades"; // 10000 emas, sizda terminalda 5000 chiqyapti

// --- AUTH TEKSHIRUVI ---
const userToken = localStorage.getItem('token');
if (!userToken) {
    window.location.href = 'login.html'; // Token bo'lmasa login sahifasiga haydaymiz
}

const form = document.querySelector("#tradeForm");
const tradesList = document.querySelector("#tradesList");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const loader = document.getElementById("loader");

let allTrades = []; 
let editMode = false;
let editId = null;

// 1. Dashboardni yangilash
function updateDashboard(trades) {
    const total = trades.length;
    const wins = trades.filter(t => String(t.natija).toLowerCase() === "win").length;
    const losses = trades.filter(t => String(t.natija).toLowerCase() === "loss").length;
    const totalProfit = trades.reduce((sum, t) => sum + (parseFloat(t.foyda) || 0), 0);
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    
    const avgRR = total > 0 ? (trades.reduce((sum, t) => {
        let val = String(t.rr).includes(':') ? parseFloat(t.rr.split(':')[1]) : parseFloat(t.rr);
        return sum + (val || 0);
    }, 0) / total).toFixed(2) : 0;

    if(document.getElementById("totalTrades")) document.getElementById("totalTrades").textContent = total;
    if(document.getElementById("wins")) document.getElementById("wins").textContent = wins;
    if(document.getElementById("losses")) document.getElementById("losses").textContent = losses;
    if(document.getElementById("winrate")) document.getElementById("winrate").textContent = winrate;
    if(document.getElementById("totalProfit")) document.getElementById("totalProfit").textContent = totalProfit.toLocaleString();
    if(document.getElementById("avgRR")) document.getElementById("avgRR").textContent = avgRR;
}

// 2. Telegramga xabar yuborish
async function sendToTelegram(data, isEdit = false) {
    const title = isEdit ? "♻️ <b>TRADE YANGILANDI (EDIT)</b>" : "📊 <b>YANGI TRADE SAQLANDI</b>";
    const userEmail = localStorage.getItem('userEmail') || "Noma'lum foydalanuvchi";
    const message = `${title}\n` +
                    `👤 Foydalanuvchi: ${userEmail}\n` + // Kim yuborganini bilish uchun
                    `──────────────────\n` +
                    `📅 Sana: ${data.sana}\n` +
                    `💱 Aktiv: ${data.aktiv}\n` +
                    `📈 Natija: ${data.natija.toUpperCase()}\n` +
                    `💵 Foyda: ${data.foyda} USD\n` +
                    `🎯 RR: ${data.rr}\n` +
                    `──────────────────`;
    
    try {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "HTML" })
        });
    } catch (e) { console.error("Telegram error:", e); }
}

// 3. Ma'lumotlarni ko'rsatish (Token bilan)
async function renderTrades(tradesToRender = null) {
    if (loader) loader.style.display = "block";
    
    try {
        if (tradesToRender === null) {
            const response = await fetch(API_URL, {
                headers: { 
                    "Content-Type": "application/json",
                    "x-auth-token": userToken 
                }
            });

            if (response.status === 401) {
                logout(); 
                return;
            }

            allTrades = await response.json();
        }

        const list = tradesToRender || allTrades;
        tradesList.innerHTML = "";
        
        if (list.length === 0) {
            tradesList.innerHTML = "<p style='text-align:center; color: #848e9c; padding:20px;'>Hali ma'lumotlar yo'q.</p>";
        } else {
            list.forEach(trade => {
                const isWin = String(trade.natija).toLowerCase() === 'win';
                const cardClass = isWin ? 'win' : 'loss';
                
                const card = document.createElement("div");
                // Klasslarni bizning yangi CSS'ga mosladik
                card.className = `trade-card ${cardClass}`; 
                
                card.innerHTML = `
                    <div class="trade-card-header">
                        <span class="trade-symbol">${trade.aktiv || '---'}</span>
                        <span class="trade-date"><i class="fa-regular fa-calendar"></i> ${trade.sana || '---'}</span>
                    </div>
                    <div class="trade-body">
                        <div class="trade-info-left">
                            <span class="trade-status-badge">
                                <i class="fa-solid ${isWin ? 'fa-circle-check' : 'fa-circle-xmark'}"></i> 
                                ${(trade.natija || '---').toUpperCase()}
                            </span>
                            <div class="trade-profit">
                                ${parseFloat(trade.foyda) >= 0 ? '+' : ''}${trade.foyda || 0} USD
                            </div>
                        </div>
                        <div class="trade-actions">
                            <i class="fa-solid fa-pen-to-square" title="Tahrirlash" onclick="startEdit('${trade._id}')"></i>
                            <i class="fa-solid fa-trash-can" title="O'chirish" onclick="deleteTrade('${trade._id}')"></i>
                        </div>
                    </div>`;
                tradesList.appendChild(card);
            });
        }
        updateDashboard(list);
        renderAnalyticsChart(list);
    } catch (e) { 
        console.error("Render xatosi:", e); 
    } finally {
        if (loader) loader.style.display = "none";
    }
}

// 4. Saqlash yoki Yangilash (Token bilan)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `${API_URL}/${editId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 
                "Content-Type": "application/json",
                "x-auth-token": userToken // TOKENni yuboramiz
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            await sendToTelegram(data, editMode);
            editMode = false;
            editId = null;
            form.reset();
            if (submitBtn) submitBtn.innerHTML = 'Saqlash <i class="fa-solid fa-floppy-disk"></i>';
            await renderTrades(null); 
            alert("Muvaffaqiyatli saqlandi! ✅");
        } else {
            alert("Xatolik: Ma'lumot saqlanmadi.");
        }
    } catch (e) {
        alert("Server bilan aloqa yo'q!");
    }
});

// 5. Tahrirlash
window.startEdit = function(id) {
    const trade = allTrades.find(t => t._id === id);
    if (!trade) return;
    editMode = true;
    editId = id;
    Object.keys(trade).forEach(key => {
        const input = form.elements[key];
        if (input) input.value = trade[key];
    });
    if (submitBtn) submitBtn.innerHTML = 'Yangilash <i class="fa-solid fa-rotate"></i>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 6. Qidiruv
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

// 7. O'chirish (Token bilan)
window.deleteTrade = async function(id) {
    if (!confirm("O'chirishni xohlaysizmi?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { 
            method: "DELETE",
            headers: { "x-auth-token": userToken }
        });
        if (res.ok) await renderTrades(null);
    } catch (e) { console.error("Xato:", e); }
};

// 8. Logout funksiyasi
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
};

// 9. Auto RR hisoblash
form.addEventListener('input', () => {
    const entry = parseFloat(form.elements['kirish'].value);
    const sl = parseFloat(form.elements['sl'].value);
    const tp = parseFloat(form.elements['tp'].value);
    if (entry && sl && tp) {
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        if (risk !== 0) {
            form.elements['rr'].value = `1:${(reward / risk).toFixed(2)}`;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => renderTrades(null));

const mobileBtn = document.getElementById('mobileMenuBtn');
const mobileDropdown = document.getElementById('mobileDropdown');

if(mobileBtn) {
    mobileBtn.addEventListener('click', () => {
        mobileDropdown.classList.toggle('show');
    });
}

// Menyu ichidagi biron bo'lim bosilsa, menyu avtomatik yopilsin
document.querySelectorAll('.m-dropdown-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileDropdown.classList.remove('show');
    });
});

// CHART JS
// Grafik obyekti (qayta chizish uchun)
let myChart = null;

function renderAnalyticsChart(trades) {
    const ctx = document.getElementById('tradingAnalyticsChart').getContext('2d');

    // Agar grafik oldin chizilgan bo'lsa, uni o'chirib yangisini chizamiz
    if (myChart) { myChart.destroy(); }

    // 1. Sanalarni tartib bilan olish (X o'qi)
    const dates = [...new Set(trades.map(t => t.sana))].sort();

    // 2. Mavjud paralar va ranglar palitrasi
    const symbols = [...new Set(trades.map(t => t.aktiv))];
    const colors = ['#f3ba2f', '#0ecb81', '#f6465d', '#3273dc', '#9b59b6'];

    // 3. Har bir para uchun professional dataset yaratish
    const datasets = symbols.map((symbol, i) => {
        let runningTotal = 0; // Jami kapitalni hisoblash uchun
        const color = colors[i % colors.length];

        return {
            label: symbol,
            // Cumulative (yig'ilib boruvchi) ma'lumotlar
            data: dates.map(date => {
                const dayTrades = trades.filter(t => t.aktiv === symbol && t.sana === date);
                const dayProfit = dayTrades.reduce((sum, t) => sum + parseFloat(t.foyda || 0), 0);
                runningTotal += dayProfit;
                return runningTotal; // Har bir kundagi jami kapital
            }),
            borderColor: color,
            // --- PROFESSIONAL STIL ---
            backgroundColor: color + '10', // Area fill (shaffof fon)
            fill: true, // Chiziq tagini bo'yash
            tension: 0.4, // Chiziqni silliq (smooth) qilish
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: color,
            pointBorderColor: '#1e2329',
            pointBorderWidth: 2,
            spanGaps: true // Bo'sh kunlarni bog'lab ketadi
        };
    });

    // 4. Grafikni yaratish
    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels: dates, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { color: '#848e9c', font: { size: 10 }, callback: value => '$ ' + value } // $ belgisi
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#848e9c', font: { size: 10 } }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#eaecef', font: { size: 12 }, padding: 15, usePointStyle: true }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#2b3139',
                    titleColor: '#eaecef',
                    bodyColor: '#848e9c',
                    borderColor: '#474d57',
                    borderWidth: 1,
                    callbacks: {
                        label: context => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            // Kursorni olib borganda chiziq ko'rsatishi
            interaction: { mode: 'nearest', axis: 'x', intersect: false }
        }
    });
}

// Calc js
// Kalkulyator elementlarini ushlab olamiz
const balanceInput = document.getElementById('calcBalance');
const riskInput = document.getElementById('calcRisk');
const slInput = document.getElementById('calcSL');
const resultInput = document.getElementById('calcResult');

// Hisoblash funksiyasi
function calculateLot() {
    const balance = parseFloat(balanceInput.value);
    const riskPercent = parseFloat(riskInput.value);
    const stopLoss = parseFloat(slInput.value);

    if (balance > 0 && riskPercent > 0 && stopLoss > 0) {
        // Formula: (Balans * Risk%) / (StopLoss * 10) 
        // Izoh: 10 koeffitsienti standart lot pips qiymati uchun (Forex)
        const totalRiskAmount = balance * (riskPercent / 100);
        const lotSize = totalRiskAmount / (stopLoss * 10);

        // Natijani 2 ta raqamgacha yaxlitlab chiqaramiz
        resultInput.value = lotSize.toFixed(2);
    } else {
        resultInput.value = "0.00";
    }
}

// Inputlarga "eshituvchi" qo'shamiz: biror narsa yozilsa funksiya ishlaydi
[balanceInput, riskInput, slInput].forEach(input => {
    input.addEventListener('input', calculateLot);
});

// Real time Live Market
// Binance WebSocket ulanishi (Faqat BTC va ETH uchun bepul)
const liveSymbols = ['btcusdt', 'ethusdt'];
const wsUrl = `wss://stream.binance.com:9443/ws/${liveSymbols.map(s => s + '@ticker').join('/')}`;
const priceWs = new WebSocket(wsUrl);

priceWs.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const symbol = data.s.toLowerCase();
    const price = parseFloat(data.c).toFixed(2);
    const change = parseFloat(data.P); // 24 soatlik o'zgarish foizi

    const priceElement = document.getElementById(`price-${symbol}`);
    if (priceElement) {
        priceElement.innerText = price;
        // Narx o'zgarishiga qarab rangni yangilash
        if (change >= 0) {
            priceElement.className = 'price up';
        } else {
            priceElement.className = 'price down';
        }
    }
};