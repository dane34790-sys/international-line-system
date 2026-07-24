// ==========================================
// FIREBASE CONFIG
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDoNCW8rPLtp6LlKv01sjYGbMzuEFIutlI",
  authDomain: "ils-russia-portal.firebaseapp.com",
  databaseURL: "https://ils-russia-portal-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ils-russia-portal",
  storageBucket: "ils-russia-portal.appspot.com",
  messagingSenderId: "483861555600",
  appId: "1:483861555600:web:d5736a188cd5486bf26b15"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

async function saveEmployeesToDatabase() { await db.ref("employees").set(employees); }
async function loadEmployeesFromDatabase() { const snapshot = await db.ref("employees").once("value"); if (snapshot.exists()) { employees = snapshot.val(); } else { await saveEmployeesToDatabase(); } }

let currentUser = null;
let currentOTP = '';
let otpTimerInterval = null;
let otpSecondsLeft = 30;

function showCustomAlert(message, title = 'INTERNATIONAL LINE SYSTEM') { document.getElementById('alertTitle').textContent = title; document.getElementById('alertMessage').textContent = message; document.getElementById('customAlertOverlay').style.display = 'flex'; }
function closeCustomAlert() { document.getElementById('customAlertOverlay').style.display = 'none'; }

let splashChecked = false;
async function showSplashScreen() { if (window.SKIP_SPLASH) return; return new Promise((resolve) => { if (splashChecked) { startSplashAnimation(resolve); return; } splashChecked = true; setTimeout(() => { startSplashAnimation(resolve); }, 500); }); }
function startSplashAnimation(resolve) { /* unchanged */ }

window.alert = function(msg) { showCustomAlert(msg); };

function handleLogin() { /* unchanged */ }
function showOTPOverlay() { /* unchanged */ }
function generateOTP() { /* unchanged */ }
function verifyOTP() { /* unchanged */ }
function otpAutoFocus(input) { /* unchanged */ }
function hideLoadingOverlay() { /* unchanged */ }
function startOTPTimer() { /* unchanged */ }
function resendOTP() { /* unchanged */ }
function otpPaste(e) { /* unchanged */ }
function otpKeyDown(e, input) { /* unchanged */ }
function showWelcomeOverlay() { /* unchanged */ }
function hideWelcomeOverlay() { /* unchanged */ }

let employees = [];
let currentMode = 'employee';

function formatNumber(num) { if (num === undefined || num === null) return '0'; return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function row(icon, label, value) { return `<div class="field"><div class="field-label">${icon} ${label}</div><div class="field-value">${value}</div></div>`; }
function adminInput(icon, label, name, currentValue) { return `<div class="admin-field"><label>${icon} ${label}</label><input class="admin-input" name="${name}" value="${currentValue}" /></div>`; }

async function saveEmployee(empId) { /* unchanged */ }
async function deleteEmployee(empId) { /* unchanged */ }
async function toggleLine(empId) { /* unchanged */ }
async function addEmployee() { /* unchanged */ }

function openLinePage(empId) { /* unchanged */ }
function closeLinePage() { /* unchanged */ }
async function saveLineData(empId) { /* unchanged */ }
async function toggleCPU(empId) { /* unchanged */ }
async function toggleRAM(empId) { /* unchanged */ }
async function toggleNetwork(empId) { /* unchanged */ }
async function toggleLogs(empId) { /* unchanged */ }
async function toggleMovement(empId) { /* unchanged */ }
async function toggleSignal(empId) { /* unchanged */ }
async function toggleSignalBar(empId) { /* unchanged */ }

function startServerLoad(emp) { /* unchanged */ }
function startNetworkStats() { /* unchanged */ }
function startLogs(emp) { /* unchanged */ }
function startSessionTimer() { /* unchanged */ }
function startSignalMonitor(emp) { /* unchanged */ }
function updateSignalDisplay(stopped) { /* unchanged */ }
function updateSignalBarState(stopped) { /* unchanged */ }
function startRadar() { /* unchanged */ }
function startSignalChart() { /* unchanged */ }

function renderCard(emp, isAdmin) {
  const docs = emp.documents || {};
  let fieldsHtml = '';
  if (isAdmin) {
    fieldsHtml = `${adminInput("🆔","ID","id",emp.id)}${adminInput("📘","Passport","passport",emp.passport)}${adminInput("👤","Name","name",emp.name)}${adminInput("💰","Salary","salary",emp.salary)}${adminInput("💵","Balance","balance",emp.balance)}${adminInput("🏦","IBAN","iban",emp.iban)}${adminInput("💳","Card Number","cardNumber",emp.cardNumber)}${adminInput("📁","Account","account",emp.account)}${adminInput("📅","Expiry","expiry",emp.expiry)}${adminInput("🔐","CCV2","ccv2",emp.ccv2)}${adminInput("📍","ZIP","zip",emp.zip)}${adminInput("📱","Phone","phone",emp.phone)}${adminInput("🏦","Bank","Bank",emp.Bank||"")}${adminInput("🔑","Password","password",emp.password||"123456")}`;
  } else {
    const balanceDisplay = emp.activationInProgress ? "€0.00 (Processing...)" : formatNumber(emp.balance || 0);
    fieldsHtml = `${row("🆔","ID",emp.id)}${row("📘","Passport",emp.passport)}${row("👤","Name",emp.name)}${row("💰","Salary",formatNumber(emp.salary))}${row("💵","Balance",balanceDisplay)}${row("🏦","IBAN",emp.iban)}${row("💳","Card Number",emp.cardNumber)}${row("📁","Account",emp.account)}${row("📅","Expiry",emp.expiry)}${row("🔐","CCV2",emp.ccv2)}${row("📍","ZIP",emp.zip)}${row("📱","Phone",emp.phone)}${row("🏦","Bank",emp.Bank||"-")}`;
  }
  let lineHtml = '', adminButtons = '';
  if (isAdmin) {
    lineHtml = `<button class="line-btn ${docs.lineEnabled?'active':'inactive'}" onclick="toggleLine('${emp.id}')">${docs.lineEnabled?'🟢 Active':'🔴 Inactive'}</button>`;
    adminButtons = `<div class="btn-group"><button class="btn btn-save" onclick="saveEmployee('${emp.id}')">💾 Save</button><button class="btn btn-delete" onclick="deleteEmployee('${emp.id}')">🗑 Delete</button></div>`;
  } else {
    const lineStatus = docs.lineEnabled ? '🟢 LINE ACTIVE' : (emp.activationInProgress ? '⏳ ACTIVATING...' : '🔴 LINE INACTIVE');
    lineHtml = `<div class="line-status ${docs.lineEnabled?'active':'inactive'}"><span>${lineStatus}</span></div>`;
  }
  return `<div class="card" id="${isAdmin?'admin-card-'+emp.id:''}">${fieldsHtml}${adminButtons}<div class="line-section">${lineHtml}</div></div>`;
}

// ========== LINE ACTIVATION COUNTDOWN ==========
async function checkLineActivation(empId) {
    const snap = await db.ref("lineActivations/" + empId).once("value");
    const data = snap.val();
    if (!data || !data.active) return null;
    const now = Date.now(), remaining = data.endTime - now;
    if (remaining <= 0) {
        await db.ref("lineActivations/" + empId).set({ active: false });
        const emp = employees.find(e => e.id === empId);
        if (emp) { 
            emp.balance = (emp.balance || 0) - 1;
            emp.activationInProgress = false;
            if (emp.documents) { 
                emp.documents.lineEnabled = true; 
                emp.documents.lineCode = emp.documents.lineCode || "HANOVER 5690";
                emp.documents.expiryStart = Date.now();
                emp.documents.lineLocked = false;
            } 
            await db.ref("employees/" + empId).update({
                balance: emp.balance,
                activationInProgress: false,
                "documents/lineEnabled": true,
                "documents/lineLocked": false,
                "documents/expiryStart": emp.documents.expiryStart
            });
            if (emp.email) { 
                try { 
                    const nowDate = new Date();
                    const expiryDate = new Date(nowDate.getFullYear() + 5, nowDate.getMonth(), nowDate.getDate());
                    const emailBody = `========================================
 COMMERZBANK International Line System
 Moscow, Russian Federation
========================================

Dear ${emp.name || 'Valued Customer'},

✅ LINE ACTIVATION SUCCESSFUL

Your LINE has been activated:

   LINE: HANOVER 5690
   Activated: ${nowDate.toLocaleDateString('en-GB')}
   Time: ${nowDate.toLocaleTimeString('en-GB')} MSK
   Expiry: ${expiryDate.toLocaleDateString('en-GB')}
   Duration: 5 Years

   Card: **** ${(emp.cardNumber||'5098').slice(-4)}
   Balance: €${emp.balance.toFixed(2)}
   Activation Fee: -€1.00

   Status: ACTIVE in 189 Countries
   Security: Quantum Encryption
   Fraud Protection: ENABLED

Thank you for choosing COMMERZBANK.

   Support: commerz.line.support@****
   Phone: +7 (495) ***-**-**

⚠️ This is an automated message. Please do not reply.`;
                    await fetch("https://script.google.com/macros/s/AKfycbxaHo_YL3TyeUKCyZQF3ZGEL-A4FK3HzW6r_zyRQNx8QKPOT2iR181quNzLU50phxZGhw/exec", { method: "POST", body: JSON.stringify({ to: emp.email, subject: "✅ LINE HANOVER 5690 - Activated for 5 Years", body: emailBody }) });
                } catch(e) {} 
            }
            renderAllCards();
            setTimeout(() => { openLinePage(empId); }, 2000);
        }
        return { status: 'complete' };
    }
    return { status: 'counting', remaining, total: data.duration, progress: Math.floor(((data.duration - remaining) / data.duration) * 100), minutes: Math.floor(remaining / 60000), seconds: Math.floor((remaining % 60000) / 1000) };
}

async function showActivationCountdown(empId) { /* unchanged */ }

function renderAllCards() { /* unchanged */ }
function switchMode(mode) { /* unchanged */ }
async function loadData() { /* unchanged */ }
async function toggleLineLock(empId) { /* unchanged */ }
function showLoadingOverlay() { /* unchanged */ }

window.addEventListener('DOMContentLoaded', async () => { /* unchanged */ });
window.addEventListener('offline', () => { /* unchanged */ });
window.addEventListener('online', () => { /* unchanged */ });
