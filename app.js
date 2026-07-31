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

// ==========================================
// DATABASE
// ==========================================
async function loadEmployeesFromDatabase() {
  const snapshot = await db.ref("employees").once("value");
  if (snapshot.exists()) {
    employees = Object.values(snapshot.val());
  } else {
    employees = [];
  }
}

// ==========================================
// GLOBAL
// ==========================================
let currentUser = null;
let currentOTP = '';
let otpTimerInterval = null;
let otpSecondsLeft = 30;
let employees = [];
let currentMode = 'employee';

// ==========================================
// AUTH WITHOUT FIREBASE AUTH
// ==========================================
async function handleLogin() {
  if (!navigator.onLine) { showCustomAlert('⚠️ No internet connection', 'CONNECTION ERROR'); return; }
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const error = document.getElementById('loginError');
  
  try {
    const snap = await db.ref("employees").once("value");
    const list = snap.val();
    let emp = null;
    
    if (Array.isArray(list)) {
      emp = list.find(e => e && e.id === id);
    } else {
      emp = Object.values(list).find(e => e && e.id === id);
    }
    
    // ادمین
    if (id === 'dani' && pass === '19831983') {
      currentMode = 'admin';
      window.isAdmin = true;
      document.getElementById('loginOverlay').style.display = 'none';
      showOTPOverlay();
      return;
    }
    
    if (!emp) {
      error.style.display = 'block';
      return;
    }
    
    if (emp.password && emp.password !== pass) {
      error.style.display = 'block';
      return;
    }
    
    currentMode = 'employee';
    window.isAdmin = false;
    currentUser = { type: 'employee', emp: emp };
    
    document.getElementById('loginOverlay').style.display = 'none';
    showOTPOverlay();
  } catch(e) {
    error.style.display = 'block';
  }
}

// ==========================================
// EMPLOYEES CRUD
// ==========================================
async function addEmployee() {
  const password = prompt("Enter password for new employee (min 6 chars):", "123456");
  if (!password || password.length < 6) { alert("❌ Password must be at least 6 characters!"); return; }
  const newId = Date.now().toString();
  const newEmp = { 
    id: newId, password, passport: "", name: "", salary: 0, balance: 0, 
    iban: "", cardNumber: "", account: "", expiry: "", ccv2: "", zip: "", 
    phone: "", Bank: "", birthDate: "", 
    documents: { lineEnabled: false, lineLocked: false, lineCode: "--------------------", 
      expiryStart: Date.now(), stopCPU: false, stopRAM: false, stopNetwork: false, 
      stopLogs: false, stopMovement: false, stopSignal: false, stopSignalBar: false } 
  };
  await db.ref("employees/" + newId).set(newEmp);
  await loadEmployeesFromDatabase();
  renderAllCards();
  alert("✅ Employee " + newId + " added!\nPassword: " + password);
}

async function deleteEmployee(empId) {
  if (!confirm('Are you sure?')) return;
  await db.ref("employees/" + empId).remove();
  await loadEmployeesFromDatabase();
  renderAllCards();
}

async function saveEmployee(empId) {
  const card = document.getElementById('admin-card-' + empId);
  if (!card) return;
  const inputs = card.querySelectorAll('input');
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  inputs.forEach(input => { 
    const key = input.name; 
    let value = input.value; 
    if (key === 'salary' || key === 'balance') value = parseFloat(value) || 0; 
    if (key === 'password' && value.trim() === '') return; 
    emp[key] = value; 
  });
  await db.ref("employees/" + empId).set(emp);
  await loadEmployeesFromDatabase();
  showCustomAlert('✅ Information saved successfully');
}

// ==========================================
// UI FUNCTIONS
// ==========================================
function showCustomAlert(message, title = 'INTERNATIONAL LINE SYSTEM') { 
  document.getElementById('alertTitle').textContent = title; 
  document.getElementById('alertMessage').textContent = message; 
  document.getElementById('customAlertOverlay').style.display = 'flex'; 
}
function closeCustomAlert() { document.getElementById('customAlertOverlay').style.display = 'none'; }

function showOTPOverlay() { 
  document.getElementById('otpOverlay').style.display = 'flex'; 
  generateOTP(); 
  startOTPTimer(); 
  for (let i = 1; i <= 6; i++) document.getElementById('otp' + i).value = ''; 
  document.getElementById('otp1').focus(); 
  document.getElementById('otpError').style.display = 'none'; 
}
function generateOTP() { 
  currentOTP = String(Math.floor(100000 + Math.random() * 900000)); 
  const notif = document.getElementById('otpNotification'), notifCode = document.getElementById('otpNotificationCode'); 
  notifCode.textContent = currentOTP; 
  notif.style.display = 'block'; 
  notif.style.top = '20px'; 
  setTimeout(() => { notif.style.top = '-100px'; }, 5000); 
}
function verifyOTP() { 
  if (!navigator.onLine) { showCustomAlert('⚠️ No internet connection', 'CONNECTION ERROR'); return; } 
  let entered = ''; 
  for (let i = 1; i <= 6; i++) entered += document.getElementById('otp' + i).value; 
  if (entered === currentOTP) { 
    document.getElementById('otpOverlay').style.display = 'none'; 
    document.getElementById('otpNotification').style.display = 'none'; 
    clearInterval(otpTimerInterval); 
    showLoadingOverlay(); 
    setTimeout(() => { 
      hideLoadingOverlay(); 
      showWelcomeOverlay(); 
      setTimeout(() => { 
        hideWelcomeOverlay(); 
        document.getElementById('mainApp').style.display = 'flex'; 
        if (currentMode === 'admin') { 
          window.isAdmin = true; 
          switchMode('admin'); 
        } else { 
          window.isAdmin = false; 
          switchMode('employee'); 
        } 
        showCustomAlert('✅ Access Granted', 'INTERNATIONAL LINE SYSTEM'); 
      }, 3000); 
    }, 7000); 
  } else { 
    document.getElementById('otpError').style.display = 'block'; 
  } 
}
function otpAutoFocus(input) { if (input.value.length === 1 && input.nextElementSibling) input.nextElementSibling.focus(); }
function hideLoadingOverlay() { document.getElementById('loadingOverlay').style.display = 'none'; }
function showLoadingOverlay() { document.getElementById('loadingOverlay').style.display = 'flex'; }
function startOTPTimer() { 
  otpSecondsLeft = 30; 
  document.getElementById('resendBtn').disabled = true; 
  document.getElementById('otpTimer').textContent = '⏳ ' + otpSecondsLeft + 's'; 
  clearInterval(otpTimerInterval); 
  otpTimerInterval = setInterval(() => { 
    otpSecondsLeft--; 
    document.getElementById('otpTimer').textContent = '⏳ ' + otpSecondsLeft + 's'; 
    if (otpSecondsLeft <= 0) { 
      clearInterval(otpTimerInterval); 
      document.getElementById('resendBtn').disabled = false; 
      document.getElementById('otpTimer').textContent = ''; 
    } 
  }, 1000); 
}
function resendOTP() { 
  generateOTP(); 
  startOTPTimer(); 
  for (let i = 1; i <= 6; i++) document.getElementById('otp' + i).value = ''; 
  document.getElementById('otp1').focus(); 
  document.getElementById('otpError').style.display = 'none'; 
}
function otpPaste(e) { 
  e.preventDefault(); 
  const paste = (e.clipboardData || window.clipboardData).getData('text'); 
  const digits = paste.replace(/\D/g, '').slice(0, 6); 
  for (let i = 0; i < 6; i++) { 
    const input = document.getElementById('otp' + (i + 1)); 
    if (input) input.value = digits[i] || ''; 
  } 
  const lastFilled = digits.length; 
  if (lastFilled < 6) document.getElementById('otp' + (lastFilled + 1))?.focus(); 
  else document.getElementById('otp6')?.focus(); 
}
function otpKeyDown(e, input) { 
  if (e.key === 'Backspace' && input.value === '') { 
    if (input.previousElementSibling) input.previousElementSibling.focus(); 
  } 
}
function showWelcomeOverlay() { 
  const el = document.getElementById('welcomeOverlay'); 
  el.style.display = 'flex'; 
}
function hideWelcomeOverlay() { document.getElementById('welcomeOverlay').style.display = 'none'; }
function formatNumber(num) { 
  if (num === undefined || num === null) return '0'; 
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
}
function row(icon, label, value) { 
  return `<div class="field"><div class="field-label">${icon} ${label}</div><div class="field-value">${value}</div></div>`; 
}
function adminInput(icon, label, name, currentValue) { 
  return `<div class="admin-field"><label>${icon} ${label}</label><input class="admin-input" name="${name}" value="${currentValue}" /></div>`; 
}

// ==========================================
// LINE FUNCTIONS
// ==========================================
async function toggleLine(empId) { 
  const emp = employees.find(e => e.id == empId); 
  if (!emp) return; 
  if (!emp.documents) emp.documents = {}; 
  emp.documents.lineEnabled = !emp.documents.lineEnabled; 
  await db.ref("employees/" + empId + "/documents/lineEnabled").set(emp.documents.lineEnabled); 
  renderAllCards(); 
}
function closeLinePage() { 
  const overlay = document.getElementById('lineOverlay'); 
  if (overlay) overlay.remove(); 
  if (!window.isAdmin) { 
    document.getElementById('mainApp').style.display = 'flex'; 
    renderAllCards(); 
  } 
}
async function toggleLineLock(empId) { 
  const emp = employees.find(e => e.id == empId); 
  if (!emp) return; 
  if (!emp.documents) emp.documents = {}; 
  emp.documents.lineLocked = !emp.documents.lineLocked; 
  await db.ref("employees/" + empId + "/documents/lineLocked").set(emp.documents.lineLocked); 
  renderAllCards(); 
}
function openLinePage(empId) { 
  const emp = employees.find(e => e.id == empId); 
  if (!emp) return; 
  if (!emp.documents) emp.documents = {}; 
  const fields = ['stopCPU','stopRAM','stopNetwork','stopLogs','stopMovement','stopSignal','stopSignalBar']; 
  fields.forEach(f => { if (emp.documents[f] === undefined) emp.documents[f] = false; }); 
  if (emp.documents.lineEnabled === undefined) emp.documents.lineEnabled = true; 
  const start = emp.documents.expiryStart || Date.now(); 
  const end = start + (5 * 365 * 24 * 60 * 60 * 1000); 
  const fullName = emp.name || 'Unknown'; 
  const birthDate = emp.birthDate || '0000/00/00'; 
  const lineCode = emp.documents.lineCode || ''; 
  const phone = emp.phone || 'Not Verified'; 
  const cardNumber = emp.cardNumber || ''; 
  const balance = emp.balance || 0; 
  const formattedBalance = Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\.00$/, ''); 
  const overlay = document.createElement('div'); 
  overlay.id = 'lineOverlay'; 
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;overflow-y:auto;color:#00ff88;font-family:'Courier New',monospace;"; 
  overlay.innerHTML = `<div style="position:relative;padding:15px;"><button onclick="closeLinePage()" style="position:sticky;top:10px;float:right;z-index:10;background:#ff1744;color:white;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;">← Back</button><div style="clear:both;"></div><div class="scan"></div><div class="access">ACCESS GRANTED</div><div style="position:relative;z-index:2;padding:15px 15px 0 15px;"><div class="employee-info-card"><div class="emp-card-header"><div class="emp-avatar"><i class="fas fa-user-circle"></i></div><div class="emp-name-title"><div class="emp-fullname"><span class="blink-dot"></span> ${fullName}</div><div class="emp-badge blink">● ONLINE</div></div><div style="font-size:20px;font-weight:700;color:#00ff88;text-shadow:0 0 20px rgba(0,255,136,0.2);">€${formattedBalance}</div></div><div class="emp-info-grid-vertical">${currentMode === 'admin' ? `<div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-calendar-alt"></i> Birth Date</span><input id="birthDateEdit" type="text" value="${birthDate}" style="background:rgba(0,20,10,0.8);border:1px solid #00ff88;color:#00ff88;padding:8px;width:100%;font-family:monospace;border-radius:4px;"></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-barcode"></i> Line Code</span><input id="lineCodeEditTop" type="text" value="${lineCode}" style="background:rgba(0,20,10,0.8);border:1px solid #00ff88;color:#00ff88;padding:8px;width:100%;font-family:monospace;border-radius:4px;"></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-phone"></i> Phone</span><input id="phoneEdit" type="text" value="${phone}" style="background:rgba(0,20,10,0.8);border:1px solid #00ff88;color:#00ff88;padding:8px;width:100%;font-family:monospace;border-radius:4px;"></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-credit-card"></i> Card Number</span><input id="cardEdit" type="text" value="${cardNumber}" style="background:rgba(0,20,10,0.8);border:1px solid #00ff88;color:#00ff88;padding:8px;width:100%;font-family:monospace;border-radius:4px;"></div>` : `<div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-calendar-alt"></i> Birth Date</span><span class="emp-info-value">${birthDate}</span></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-barcode"></i> Line Code</span><span class="emp-info-value" style="font-family:monospace;letter-spacing:1px;word-break:break-all;">${lineCode||'—'}</span></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-phone"></i> Phone</span><span class="emp-info-value">${phone}</span></div><div class="emp-info-item"><span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-credit-card"></i> Card Number</span><span class="emp-info-value" style="font-family:monospace;letter-spacing:2px;word-break:break-all;">${cardNumber||'—'}</span></div>`}</div></div></div><div class="dashboard" style="position:relative;z-index:1;padding-top:5px;"><div class="cyber-panel"><div class="cyber-title"><span class="blink-dot"></span> SERVER LOAD</div>CPU<div class="bar"><div id="cpu" class="fill"></div></div><br>RAM<div class="bar"><div id="ram" class="fill"></div></div><br>NETWORK<div class="bar"><div id="network" class="fill"></div></div></div><div class="cyber-panel"><div class="cyber-title"><span class="blink-dot"></span> NETWORK ${emp.documents.Codeline||"Hanover 5690"}</div><div style="margin:6px 0;">ASIA: <span class="online-blink blink">${emp.documents.stopNetwork?"STOPPED":"ONLINE"}</span></div><div style="margin:6px 0;">EUROPE: <span class="online-blink blink">${emp.documents.stopNetwork?"STOPPED":"ONLINE"}</span></div><div style="margin:6px 0;">AMERICA: <span class="online-blink blink">${emp.documents.stopNetwork?"STOPPED":"ONLINE"}</span></div><div style="margin:6px 0;">AFRICA: <span class="online-blink blink">${emp.documents.stopNetwork?"STOPPED":"ONLINE"}</span></div></div><div class="cyber-panel"><div style="font-size:12px;opacity:.7;" class="blink-label">START DATE</div><input id="startDate" type="text" ${currentMode==='admin'?"":"readonly"} value="${new Date(start).toISOString().split('T')[0]}" style="width:100%;margin-bottom:10px;background:${currentMode==='admin'?'#001f12':'transparent'};border:${currentMode==='admin'?'1px solid #00ff88':'none'};outline:none;color:#00ff88;padding:6px;"><div style="font-size:12px;opacity:.7;" class="blink-label">END DATE</div><input id="endDate" type="text" ${currentMode==='admin'?"":"readonly"} value="${new Date(end).toISOString().split('T')[0]}" style="width:100%;margin-bottom:10px;background:${currentMode==='admin'?'#001f12':'transparent'};border:${currentMode==='admin'?'1px solid #00ff88':'none'};outline:none;color:#00ff88;padding:6px;"><div style="font-size:12px;opacity:.7;" class="blink-label">LINE CODE</div><input id="lineCodeEdit" ${currentMode==='admin'?"":"disabled"} value="${emp.documents.lineCode||''}" style="width:100%;background:${currentMode==='admin'?'#001f12':'transparent'};border:${currentMode==='admin'?'1px solid #00ff88':'none'};outline:none;color:#00ff88;padding:6px;font-size:14px;margin-bottom:10px;">${currentMode==='admin'?`<button onclick="saveLineData('${emp.id}')" style="width:100%;background:#009944;color:white;border:none;padding:10px;border-radius:8px;font-size:15px;font-weight:bold;margin-bottom:8px;cursor:pointer;">💾 SAVE</button><button onclick="toggleCPU('${emp.id}')" style="width:100%;background:#ff9800;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ CPU ${emp.documents.stopCPU?'RESUME':'STOP'}</button><button onclick="toggleRAM('${emp.id}')" style="width:100%;background:#ff5722;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ RAM ${emp.documents.stopRAM?'RESUME':'STOP'}</button><button onclick="toggleNetwork('${emp.id}')" style="width:100%;background:#9c27b0;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ NETWORK ${emp.documents.stopNetwork?'RESUME':'STOP'}</button><button onclick="toggleLogs('${emp.id}')" style="width:100%;background:#f44336;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ LOG ${emp.documents.stopLogs?'RESUME':'STOP'}</button><button onclick="toggleMovement('${emp.id}')" style="width:100%;background:#e91e63;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ MOVEMENT ${emp.documents.stopMovement?'RESUME':'STOP'}</button><button onclick="toggleSignal('${emp.id}')" style="width:100%;background:#3f51b5;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">📡 SIGNAL ${emp.documents.stopSignal?'RESUME':'STOP'}</button><button onclick="toggleSignalBar('${emp.id}')" style="width:100%;background:#e91e63;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">📊 SIGNAL BAR ${emp.documents.stopSignalBar?'RESUME':'STOP'}</button><button onclick="closeLinePage()" style="width:100%;background:#333;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">🔙 BACK</button>`:`<div class="cyber-panel mini-monitor"><div class="cyber-title"><span class="blink-dot"></span> EMPLOYEE STATUS</div><div class="status-line">ACCESS <span style="color:#00ff88;">GRANTED</span></div><div class="status-line">SECURITY <span style="color:#00ff88;" class="blink">ACTIVE</span></div><div class="status-line">SESSION <span id="sessionTime">00:00:00</span></div><div class="status-line">SIGNAL <span id="signalValue">100%</span></div><div class="signal-bar"><div id="signalFill"></div></div></div><div class="cyber-panel system-health" style="margin-top:10px;padding:8px;"><div class="cyber-title" style="font-size:11px;text-align:center;margin-bottom:4px;"><span class="blink-dot"></span> 🛰️ RADAR SCAN</div><div style="display:flex;justify-content:center;align-items:center;flex-direction:column;"><canvas id="radarCanvas" width="130" height="130" style="background:transparent;max-width:100%;"></canvas><div style="display:flex;justify-content:space-around;width:100%;margin-top:2px;font-size:8px;flex-wrap:wrap;gap:2px;"><span>TARGETS: <span id="targetCount" style="color:#00ff88;">12</span></span><span>SIGNAL: <span id="signalPower" style="color:#00ff88;">94%</span></span><span>STATUS: <span id="scanStatus" style="color:#ff9800;">ACTIVE</span></span></div></div></div>`}</div><div class="cyber-panel earth-panel"><div class="cyber-title"><span class="blink-dot"></span> GLOBAL NETWORK</div><canvas id="earth"></canvas><div class="network-status"><div class="status-title">NETWORK STATUS</div><div class="status-online blink">● ONLINE</div><div class="status-grid"><div class="status-box"><span>NODES</span><b id="nodesCount">1287</b></div><div class="status-box"><span>LATENCY</span><b id="latency">48 ms</b></div><div class="status-box"><span>UPTIME</span><b id="uptime">99.98%</b></div></div></div></div><div class="cyber-panel logs"><div class="cyber-title"><span class="blink-dot"></span> LIVE SERVER LOG</div><div id="logArea"></div></div></div><div class="led"></div></div><div class="cyber-panel signal-monitor"><div class="signal-header"><div class="cyber-title"><span class="blink-dot"></span> NETWORK SIGNAL MONITOR</div><div class="signal-state blink" id="signalState">📶 STRONG SIGNAL SIMCARD</div></div><canvas id="signalChart" width="900" height="170"></canvas><div class="signal-info"><div class="signal-box"><div class="signal-label">SIGNAL SIMCARD</div><div class="signal-value" id="dbmValue">-42 dBm</div></div><div class="signal-box"><div class="signal-label">NOISE SIM</div><div class="signal-value" id="noiseValue">-92 dBm</div></div><div class="signal-box"><div class="signal-label">ANTENNA LOSS</div><div class="signal-value" id="lossValue">0.00%</div></div><div class="signal-box"><div class="signal-label">CONNECTION</div><div class="signal-value" id="connectionValue">STABLE</div></div></div></div>`; 
  document.body.appendChild(overlay); 
  setTimeout(() => { 
    startSignalChart(); 
    startRadar(); 
    startServerLoad(emp); 
    startNetworkStats(); 
    startLogs(emp); 
    startSessionTimer(); 
    startSignalMonitor(emp); 
    updateSignalDisplay(emp.documents.stopSignal || false); 
    updateSignalBarState(emp.documents.stopSignalBar || false); 
  }, 100); 
}

async function saveLineData(empId) { 
  const emp = employees.find(e => e.id == empId); 
  if (!emp) return; 
  if (currentMode === 'admin') { 
    const birthInput = document.getElementById('birthDateEdit'), phoneInput = document.getElementById('phoneEdit'), cardInput = document.getElementById('cardEdit'), lineCodeTop = document.getElementById('lineCodeEditTop'); 
    if (birthInput) emp.birthDate = birthInput.value; 
    if (phoneInput) emp.phone = phoneInput.value; 
    if (cardInput) emp.cardNumber = cardInput.value; 
    if (lineCodeTop) emp.documents.lineCode = lineCodeTop.value; 
  } 
  const startDateInput = document.getElementById('startDate'); 
  if (startDateInput) emp.documents.expiryStart = new Date(startDateInput.value + "T00:00:00").getTime(); 
  await db.ref("employees/" + empId + "/documents").set(emp.documents); 
  alert("✅ LINE UPDATED"); 
  closeLinePage(); 
}
async function toggleCPU(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopCPU = !e.documents.stopCPU; await db.ref("employees/" + empId + "/documents/stopCPU").set(e.documents.stopCPU); closeLinePage(); openLinePage(empId); }
async function toggleRAM(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopRAM = !e.documents.stopRAM; await db.ref("employees/" + empId + "/documents/stopRAM").set(e.documents.stopRAM); closeLinePage(); openLinePage(empId); }
async function toggleNetwork(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopNetwork = !e.documents.stopNetwork; await db.ref("employees/" + empId + "/documents/stopNetwork").set(e.documents.stopNetwork); closeLinePage(); openLinePage(empId); }
async function toggleLogs(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopLogs = !e.documents.stopLogs; await db.ref("employees/" + empId + "/documents/stopLogs").set(e.documents.stopLogs); closeLinePage(); openLinePage(empId); }
async function toggleMovement(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopMovement = !e.documents.stopMovement; await db.ref("employees/" + empId + "/documents/stopMovement").set(e.documents.stopMovement); closeLinePage(); openLinePage(empId); }
async function toggleSignal(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopSignal = !e.documents.stopSignal; await db.ref("employees/" + empId + "/documents/stopSignal").set(e.documents.stopSignal); closeLinePage(); openLinePage(empId); }
async function toggleSignalBar(empId) { const e = employees.find(x => x.id == empId); if (!e) return; e.documents.stopSignalBar = !e.documents.stopSignalBar; await db.ref("employees/" + empId + "/documents/stopSignalBar").set(e.documents.stopSignalBar); closeLinePage(); openLinePage(empId); }

// ===== ANIMATION FUNCTIONS =====
function startServerLoad(emp) { const cpu = document.getElementById("cpu"), ram = document.getElementById("ram"), network = document.getElementById("network"); if (cpu || ram || network) setInterval(() => { if (cpu && !emp.documents.stopCPU) cpu.style.width = (40 + Math.random() * 60) + "%"; if (ram && !emp.documents.stopRAM) ram.style.width = (30 + Math.random() * 60) + "%"; if (network && !emp.documents.stopMovement) network.style.width = (30 + Math.random() * 60) + "%"; }, 1000); }
function startNetworkStats() { const nc = document.getElementById("nodesCount"), l = document.getElementById("latency"), u = document.getElementById("uptime"); if (nc) setInterval(() => { nc.textContent = 1200 + Math.floor(Math.random() * 400); l.textContent = (20 + Math.floor(Math.random() * 40)) + " ms"; u.textContent = (99.90 + Math.random() * 0.09).toFixed(2) + "%"; }, 800); }
function startLogs(emp) { if (window.logInterval) clearInterval(window.logInterval); const logs = ["AUTH SUCCESS","DATABASE VERIFIED","FIREBASE CONNECTED","API RESPONSE 200","TOKEN GENERATED","EMPLOYEE SYNC","NETWORK ACTIVE","SERVER READY","ENCRYPTION ENABLED","BACKUP COMPLETED"]; const logArea = document.getElementById("logArea"); if (!logArea) return; window.logInterval = setInterval(() => { if (emp.documents.stopLogs) return; const div = document.createElement("div"); div.style.margin = "4px 0"; div.innerText = "[" + new Date().toLocaleTimeString("en-GB", { hour12: false }) + "] " + logs[Math.floor(Math.random() * logs.length)]; logArea.appendChild(div); if (logArea.children.length > 18) logArea.removeChild(logArea.firstChild); }, 400); }
function startSessionTimer() { if (window.sessionInterval) clearInterval(window.sessionInterval); let s = 0; window.sessionInterval = setInterval(() => { s++; const el = document.getElementById("sessionTime"); if (el) { const h = String(Math.floor(s / 3600)).padStart(2, '0'), m = String(Math.floor((s % 3600) / 60)).padStart(2, '0'), sec = String(s % 60).padStart(2, '0'); el.textContent = `${h}:${m}:${sec}`; } }, 1000); }
function startSignalMonitor(emp) { const dbm = document.getElementById("dbmValue"), noise = document.getElementById("noiseValue"), loss = document.getElementById("lossValue"), conn = document.getElementById("connectionValue"); if (dbm && noise && loss && conn) setInterval(() => { if (emp.documents.stopSignal) return; dbm.textContent = -(40 + Math.floor(Math.random() * 45)) + " dBm"; noise.textContent = -(80 + Math.floor(Math.random() * 15)) + " dBm"; loss.textContent = (Math.random() * 0.5).toFixed(2) + "%"; conn.textContent = "STABLE"; conn.style.color = "#00ff88"; }, 1500); }
function updateSignalDisplay(stopped) { const ss = document.getElementById('signalState'); if (ss) { ss.textContent = stopped ? '📶 SIGNAL STOPPED' : '📶 STRONG SIGNAL SIMCARD'; ss.style.color = stopped ? '#ff5252' : '#00ff88'; } }
function updateSignalBarState(stopped) { const sf = document.getElementById('signalFill'), sv = document.getElementById('signalValue'); if (!sf || !sv) return; if (stopped) { sf.style.width = '50%'; sf.style.background = '#ff1744'; sv.textContent = 'STOPPED'; sv.style.color = '#ff
