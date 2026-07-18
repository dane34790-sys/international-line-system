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

async function saveEmployeesToDatabase() {
  await db.ref("employees").set(employees);
}

async function loadEmployeesFromDatabase() {
  const snapshot = await db.ref("employees").once("value");
  if (snapshot.exists()) {
    employees = snapshot.val();
  } else {
    await saveEmployeesToDatabase();
  }
}

// ==========================================
// بقیه کد اصلی تو...
// ==========================================
let currentUser = null;
// ==========================================
// AUTHENTICATION & OTP
// ==========================================
let currentOTP = '';
let otpTimerInterval = null;
let otpSecondsLeft = 30;

// ========== CUSTOM ALERT (Glass) ==========
function showCustomAlert(message, title = 'INTERNATIONAL LINE SYSTEM') {
  document.getElementById('alertTitle').textContent = title;
  document.getElementById('alertMessage').textContent = message;
  document.getElementById('customAlertOverlay').style.display = 'flex';
}

function closeCustomAlert() {
  document.getElementById('customAlertOverlay').style.display = 'none';
}

let splashChecked = false;

async function showSplashScreen() {
    if (window.SKIP_SPLASH) return;

    return new Promise((resolve) => {
        if (splashChecked) {
            startSplashAnimation(resolve);
            return;
        }
        
        splashChecked = true;
        setTimeout(() => {
            startSplashAnimation(resolve);
        }, 500);
    });
}

function startSplashAnimation(resolve) {
    const messages = [
        "🔹 Initializing System...",
        "🔹 Loading Modules...",
        "🔹 Connecting to Database...",
        "🔹 Server Status: ONLINE",
        "🔹 Encryption: ACTIVE",
        "🔹 International Line System Russia",
        "🔹 System Ready!"
    ];

    let msgIndex = 0;
    let charIndex = 0;
    let progress = 0;

    document.getElementById("app").innerHTML = `
        <div class="splash-screen" style="
            display:flex;
            flex-direction:column;
            justify-content:center;
            align-items:center;
            height:100vh;
            width:100vw;
            background:#000000;
            color:#00ff88;
            font-family:'Courier New', monospace;
            padding:20px;
            box-sizing:border-box;
            position:fixed;
            top:0;
            left:0;
            z-index:99999;
        ">
            <div style="display:flex; gap:3px; margin-bottom:3px; justify-content:center; flex-wrap:wrap; max-width:350px;">
                ${["I","N","T","E","R","N","A","T","I","O","N","A","L"].map((char, i) => `
                    <div id="charBox_${i}" style="width:22px; height:30px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; background:rgba(0,255,136,0.03); border:1px solid rgba(0,255,136,0.08); border-radius:3px; color:rgba(0,255,136,0.08); transition:all 0.4s ease; font-family:'Courier New', monospace;">${char}</div>
                `).join('')}
            </div>
            <div style="display:flex; gap:3px; margin-bottom:3px; justify-content:center; flex-wrap:wrap;">
                ${["L","I","N","E"].map((char, i) => `
                    <div id="charBox_${i + 13}" style="width:22px; height:30px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; background:rgba(0,255,136,0.03); border:1px solid rgba(0,255,136,0.08); border-radius:3px; color:rgba(0,255,136,0.08); transition:all 0.4s ease; font-family:'Courier New', monospace;">${char}</div>
                `).join('')}
            </div>
            <div style="display:flex; gap:3px; margin-bottom:3px; justify-content:center; flex-wrap:wrap;">
                ${["S","Y","S","T","E","M"].map((char, i) => `
                    <div id="charBox_${i + 17}" style="width:22px; height:30px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; background:rgba(0,255,136,0.03); border:1px solid rgba(0,255,136,0.08); border-radius:3px; color:rgba(0,255,136,0.08); transition:all 0.4s ease; font-family:'Courier New', monospace;">${char}</div>
                `).join('')}
            </div>
            <div style="display:flex; gap:3px; margin-bottom:25px; justify-content:center; flex-wrap:wrap;">
                ${["R","U","S","S","I","A"].map((char, i) => `
                    <div id="charBox_${i + 23}" style="width:22px; height:30px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; background:rgba(0,255,136,0.03); border:1px solid rgba(0,255,136,0.08); border-radius:3px; color:rgba(0,255,136,0.08); transition:all 0.4s ease; font-family:'Courier New', monospace;">${char}</div>
                `).join('')}
            </div>
            <div style="font-size:9px; color:rgba(0,255,136,0.3); margin-bottom:20px; letter-spacing:2px;">INTERNATIONAL LINE COMPANY</div>
            <div style="font-size:10px; color:rgba(0,255,136,0.2); margin-bottom:20px; letter-spacing:3px;">─── SYSTEM INITIALIZATION ───</div>
            <div id="typingText" style="font-size:13px; min-height:150px; color:#00ff88; text-shadow:0 0 20px rgba(0,255,136,0.15); font-family:'Courier New', monospace; text-align:left; letter-spacing:1px; margin-bottom:20px; line-height:1.8; width:85%; max-width:350px;"><span id="cursor" style="display:inline-block; width:2px; height:16px; background:#00ff88; animation: blink 0.8s infinite;"></span></div>
            <div style="width:60%; max-width:300px; height:3px; background:rgba(0,255,136,0.06); border-radius:2px; overflow:hidden; border:1px solid rgba(0,255,136,0.03);"><div id="progressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #00ff88, #00c853, #00ff88); background-size:200% 100%; animation: progressGlow 1.5s ease-in-out infinite; border-radius:2px; transition:width 0.3s;"></div></div>
            <div style="margin-top:12px; font-size:10px; color:rgba(0,255,136,0.35); letter-spacing:2px;"><span id="progressText">0%</span></div>
        </div>
        <style>
            @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
            @keyframes progressGlow { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .char-active { background:rgba(0,255,136,0.2) !important; border-color:#00ff88 !important; color:#00ff88 !important; box-shadow:0 0 25px rgba(0,255,136,0.25) !important; transform:scale(1.05); }
        </style>
    `;

    const totalChars = 29;
    let currentCharIndex = 0;
    const typingElement = document.getElementById('typingText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    function lightUpNextChar() {
        if (currentCharIndex < totalChars) {
            const box = document.getElementById(`charBox_${currentCharIndex}`);
            if (box) box.classList.add('char-active');
            currentCharIndex++;
            setTimeout(lightUpNextChar, 150);
        }
    }
    setTimeout(lightUpNextChar, 300);

    function typeMessage() {
        if (msgIndex >= messages.length) {
            setTimeout(() => { resolve(); }, 2000);
            return;
        }
        const fullText = messages[msgIndex];
        const displayText = fullText.substring(0, charIndex);
        let fullDisplay = '';
        for (let i = 0; i < msgIndex; i++) fullDisplay += messages[i] + '\n';
        fullDisplay += displayText;
        typingElement.innerHTML = `${fullDisplay}<span id="cursor" style="display:inline-block; width:2px; height:16px; background:#00ff88; animation: blink 0.8s infinite;"></span>`;
        progress = (msgIndex / messages.length) * 100 + (charIndex / fullText.length) * (100 / messages.length);
        progressBar.style.width = Math.min(progress, 100) + "%";
        progressText.textContent = Math.floor(Math.min(progress, 100)) + "%";
        charIndex++;
        if (charIndex <= fullText.length) {
            setTimeout(typeMessage, 70);
        } else {
            msgIndex++;
            charIndex = 0;
            setTimeout(typeMessage, 400);
        }
    }
    setTimeout(typeMessage, 300);
}

// جایگزین خودکار برای alert های قبلی
window.alert = function(msg) {
  showCustomAlert(msg);
};

// ========== LOGIN ==========
function handleLogin() {
  if (!navigator.onLine) {
    showCustomAlert('⚠️ No internet connection', 'CONNECTION ERROR');
    return;
  }
  
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const error = document.getElementById('loginError');

  auth.signInWithEmailAndPassword(id + "@ils.com", pass)
    .then(() => {
      if (id === 'dani') {
        currentMode = 'admin';
        window.isAdmin = true;
      } else {
        currentMode = 'employee';
        window.isAdmin = false;
        currentUser = { type: 'employee', emp: employees.find(e => e.id === id) };
      }
      document.getElementById('loginOverlay').style.display = 'none';
      showOTPOverlay();
    })
    .catch(() => {
      error.style.display = 'block';
    });
}
// ========== OTP ==========
function showOTPOverlay() {
  document.getElementById('otpOverlay').style.display = 'flex';
  generateOTP();
  startOTPTimer();
  for (let i = 1; i <= 6; i++) {
    document.getElementById('otp' + i).value = '';
  }
  document.getElementById('otp1').focus();
  document.getElementById('otpError').style.display = 'none';
}

function generateOTP() {
  currentOTP = String(Math.floor(100000 + Math.random() * 900000));
  
  const notif = document.getElementById('otpNotification');
  const notifCode = document.getElementById('otpNotificationCode');
  notifCode.textContent = currentOTP;
  notif.style.display = 'block';
  
  setTimeout(() => {
    notif.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => {
      notif.style.display = 'none';
    }, 600);
  }, 5000);
}

function verifyOTP() {
  if (!navigator.onLine) {
    showCustomAlert('⚠️ No internet connection', 'CONNECTION ERROR');
    return;
  }
  
  let entered = '';
  for (let i = 1; i <= 6; i++) {
    entered += document.getElementById('otp' + i).value;
  }

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
        
        if (currentMode === 'admin') {
          window.isAdmin = true;
          document.getElementById('mainApp').style.display = 'flex';
          switchMode('admin');
        } else {
          window.isAdmin = false;
          document.getElementById('mainApp').style.display = 'flex';
          switchMode('employee');
        }
        showCustomAlert('✅ Access Granted', 'INTERNATIONAL LINE SYSTEM');
      }, 3000);
      
    }, 7000);
    
  } else {
    document.getElementById('otpError').style.display = 'block';
  }
}
function otpAutoFocus(input) {
  if (input.value.length === 1 && input.nextElementSibling) {
    input.nextElementSibling.focus();
  }
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

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
  for (let i = 1; i <= 6; i++) {
    document.getElementById('otp' + i).value = '';
  }
  document.getElementById('otp1').focus();
  document.getElementById('otpError').style.display = 'none';
}
function otpPaste(e) {
  e.preventDefault();
  const paste = (e.clipboardData || window.clipboardData).getData('text');
  const digits = paste.replace(/\D/g, '').slice(0, 6);
  
  for (let i = 0; i < 6; i++) {
    const input = document.getElementById('otp' + (i + 1));
    if (input) {
      input.value = digits[i] || '';
    }
  }
  
  const lastFilled = digits.length;
  if (lastFilled < 6) {
    document.getElementById('otp' + (lastFilled + 1))?.focus();
  } else {
    document.getElementById('otp6')?.focus();
  }
}

function otpKeyDown(e, input) {
  if (e.key === 'Backspace' && input.value === '') {
    if (input.previousElementSibling) {
      input.previousElementSibling.focus();
    }
  }
}

function showWelcomeOverlay() {
  const el = document.getElementById('welcomeOverlay');
  el.style.display = 'flex';
  el.style.backgroundImage = "url('images/auth-bg.png')";
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundColor = '#000';
}

function hideWelcomeOverlay() {
  const el = document.getElementById('welcomeOverlay');
  el.style.display = 'none';
}

// ========== Sample Data (with LINE fields) ==========
let employees = [
  {
    id: "1001",
    password: "123456",
    passport: "A12345678",
    name: "Ali Rezaei",
    salary: 2500,
    balance: 8900.50,
    iban: "IR123456789012345678901234",
    cardNumber: "6037-9911-2233-4455",
    account: "1234567890",
    expiry: "12/27",
    ccv2: "123",
    zip: "1234567890",
    phone: "09121234567",
    Bank: "",
    birthDate: "1990/05/15",
    documents: {
      lineEnabled: true,
      lineLocked: false,
      lineCode: "Ty87jo329gfd441m",
      expiryStart: Date.now(),
      stopCPU: false,
      stopRAM: false,
      stopNetwork: false,
      stopLogs: false,
      stopMovement: false,
      stopSignal: false,
      stopSignalBar: false
    }
  },
  {
    id: "1002",
    password: "123456",
    passport: "B98765432",
    name: "Maryam Ahmadi",
    salary: 3200,
    balance: 12500,
    iban: "IR987654321098765432109876",
    cardNumber: "5022-8877-6655-4433",
    account: "9876543210",
    expiry: "08/26",
    ccv2: "456",
    zip: "9876543210",
    phone: "09129876543",
    Bank: "",
    birthDate: "1988/08/20",
    documents: {
      lineEnabled: false,
      lineLocked: false,
      lineCode: "Xy99kl456hjk789a",
      expiryStart: Date.now(),
      stopCPU: false,
      stopRAM: false,
      stopNetwork: false,
      stopLogs: false,
      stopMovement: false,
      stopSignal: false,
      stopSignalBar: false
    }
  }
];

let currentMode = 'employee';

// ========== Helpers ==========
function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function row(icon, label, value) {
  return `
    <div class="field">
      <div class="field-label">${icon} ${label}</div>
      <div class="field-value">${value}</div>
    </div>
  `;
}

function adminInput(icon, label, name, currentValue) {
  return `
    <div class="admin-field">
      <label>${icon} ${label}</label>
      <input class="admin-input" name="${name}" value="${currentValue}" />
    </div>
  `;
}

// ========== Actions ==========
async function saveEmployee(empId) {
  const card = document.getElementById(`admin-card-${empId}`);
  if (!card) return;
  const inputs = card.querySelectorAll('input');
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;

  inputs.forEach(input => {
    const key = input.name;
    let value = input.value;
    if (key === 'salary' || key === 'balance') {
      value = parseFloat(value) || 0;
    }
    if (key === 'password' && value.trim() === '') {
      return;
    }
    emp[key] = value;
  });

  await saveEmployeesToDatabase();
  showCustomAlert('✅ Information saved successfully');
}

async function deleteEmployee(empId) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  employees = employees.filter(e => e.id != empId);
  await saveEmployeesToDatabase();
  renderAllCards();
}

async function toggleLine(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  if (!emp.documents) emp.documents = {};
  emp.documents.lineEnabled = !emp.documents.lineEnabled;
  await saveEmployeesToDatabase();
  renderAllCards();
}

async function addEmployee() {
  const newId = Date.now().toString();
  const defaultPassword = "123456";
  const email = newId + "@ils.com";

  try {
    // 🎯 این خط معجزه می‌کنه - کاربر Auth رو اتوماتیک می‌سازه
    await auth.createUserWithEmailAndPassword(email, defaultPassword);
    console.log("✅ Auth user created: " + email);
  } catch(e) {
    if (e.code === 'auth/email-already-in-use') {
      alert("⚠️ User already exists!");
      return;
    }
    console.error(e);
  }

  const newEmp = {
    id: newId,
    password: defaultPassword,
    email: email,
    passport: "",
    name: "",
    salary: 0,
    balance: 0,
    iban: "",
    cardNumber: "",
    account: "",
    expiry: "",
    ccv2: "",
    zip: "",
    phone: "",
    Bank: "",
    birthDate: "",
    documents: {
      lineEnabled: false,
      lineLocked: false,
      lineCode: "--------------------",
      expiryStart: Date.now(),
      stopCPU: false,
      stopRAM: false,
      stopNetwork: false,
      stopLogs: false,
      stopMovement: false,
      stopSignal: false,
      stopSignalBar: false
    }
  };

  employees.push(newEmp);
  await saveEmployeesToDatabase();
  renderAllCards();
  alert("✅ Employee " + newId + " added!\nEmail: " + email);
}

// ========== LINE Page (Overlay) ==========
function openLinePage(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;

  if (!emp.documents) emp.documents = {};

  const fields = ['stopCPU', 'stopRAM', 'stopNetwork', 'stopLogs', 'stopMovement', 'stopSignal', 'stopSignalBar'];
  fields.forEach(f => {
    if (emp.documents[f] === undefined) emp.documents[f] = false;
  });

  if (emp.documents.lineEnabled === undefined) emp.documents.lineEnabled = true;

  const start = emp.documents.expiryStart || Date.now();
  const end = start + (5 * 365 * 24 * 60 * 60 * 1000);

  const fullName = emp.name || 'Unknown';
  const birthDate = emp.birthDate || '0000/00/00';
  const lineCode = emp.documents.lineCode || '';
  const phone = emp.phone || 'Not Verified';
  const cardNumber = emp.cardNumber || '';
  const balance = emp.balance || 0;

  const formattedBalance = Number(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace(/\.00$/, '');

  const overlay = document.createElement('div');
  overlay.id = 'lineOverlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: #000; z-index: 9999; overflow-y: auto; color: #00ff88;
    font-family: 'Courier New', monospace;
  `;

  overlay.innerHTML = `
    <div style="position:relative; padding:15px;">
      <button onclick="closeLinePage()" style="
        position: sticky; top: 10px; float: right; z-index: 10;
        background:#ff1744; color:white; border:none; padding:10px 20px;
        border-radius:8px; font-weight:bold; cursor:pointer;
      ">← Back</button>
      <div style="clear:both;"></div>

      <div class="scan"></div>
      <div class="access">ACCESS GRANTED</div>

      <!-- Employee Info Card -->
      <div style="position:relative; z-index:2; padding:15px 15px 0 15px;">
        <div class="employee-info-card">
          <div class="emp-card-header">
            <div class="emp-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="emp-name-title">
              <div class="emp-fullname"><span class="blink-dot"></span> ${fullName}</div>
              <div class="emp-badge blink">● ONLINE</div>
            </div>
            <div style="font-size:20px; font-weight:700; color:#00ff88; text-shadow:0 0 20px rgba(0,255,136,0.2);">
              €${formattedBalance}
            </div>
          </div>
          <div class="emp-info-grid-vertical">
            ${currentMode === 'admin' ? `
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-calendar-alt"></i> Birth Date</span>
                <input id="birthDateEdit" type="text" value="${birthDate}" style="background:rgba(0,20,10,0.8); border:1px solid #00ff88; color:#00ff88; padding:8px; width:100%; font-family:monospace; border-radius:4px;">
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-barcode"></i> Line Code</span>
                <input id="lineCodeEditTop" type="text" value="${lineCode}" style="background:rgba(0,20,10,0.8); border:1px solid #00ff88; color:#00ff88; padding:8px; width:100%; font-family:monospace; letter-spacing:1px; border-radius:4px;">
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-phone"></i> Phone</span>
                <input id="phoneEdit" type="text" value="${phone}" style="background:rgba(0,20,10,0.8); border:1px solid #00ff88; color:#00ff88; padding:8px; width:100%; font-family:monospace; border-radius:4px;">
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-credit-card"></i> Card Number</span>
                <input id="cardEdit" type="text" value="${cardNumber}" style="background:rgba(0,20,10,0.8); border:1px solid #00ff88; color:#00ff88; padding:8px; width:100%; font-family:monospace; letter-spacing:2px; border-radius:4px;">
              </div>
            ` : `
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-calendar-alt"></i> Birth Date</span>
                <span class="emp-info-value">${birthDate}</span>
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-barcode"></i> Line Code</span>
                <span class="emp-info-value" style="font-family:monospace;letter-spacing:1px; word-break:break-all;">${lineCode || '—'}</span>
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-phone"></i> Phone</span>
                <span class="emp-info-value">${phone}</span>
              </div>
              <div class="emp-info-item">
                <span class="emp-info-label"><span class="blink-dot"></span> <i class="fas fa-credit-card"></i> Card Number</span>
                <span class="emp-info-value" style="font-family:monospace;letter-spacing:2px; word-break:break-all;">${cardNumber || '—'}</span>
              </div>
            `}
          </div>
        </div>
      </div>

      <div class="dashboard" style="position:relative; z-index:1; padding-top:5px;">

        <!-- SERVER LOAD -->
        <div class="cyber-panel">
          <div class="cyber-title"><span class="blink-dot"></span> SERVER LOAD</div>
          CPU
          <div class="bar"><div id="cpu" class="fill"></div></div>
          <br>
          RAM
          <div class="bar"><div id="ram" class="fill"></div></div>
          <br>
          NETWORK
          <div class="bar"><div id="network" class="fill"></div></div>
        </div>

        <!-- NETWORK STATUS -->
        <div class="cyber-panel">
          <div class="cyber-title"><span class="blink-dot"></span> NETWORK ${emp.documents.Codeline || "Hanover 5690"}</div>
          <div style="margin:6px 0;">ASIA: <span class="online-blink blink">${emp.documents.stopNetwork ? "STOPPED" : "ONLINE"}</span></div>
          <div style="margin:6px 0;">EUROPE: <span class="online-blink blink">${emp.documents.stopNetwork ? "STOPPED" : "ONLINE"}</span></div>
          <div style="margin:6px 0;">AMERICA: <span class="online-blink blink">${emp.documents.stopNetwork ? "STOPPED" : "ONLINE"}</span></div>
          <div style="margin:6px 0;">AFRICA: <span class="online-blink blink">${emp.documents.stopNetwork ? "STOPPED" : "ONLINE"}</span></div>
        </div>

        <!-- DATE & LINE CODE -->
        <div class="cyber-panel">
          <div style="font-size:12px;opacity:.7;" class="blink-label">START DATE</div>
          <input id="startDate" type="text" ${currentMode === 'admin' ? "" : "readonly"} value="${new Date(start).toISOString().split('T')[0]}" style="width:100%;margin-bottom:10px;background:${currentMode === 'admin' ? '#001f12' : 'transparent'};border:${currentMode === 'admin' ? '1px solid #00ff88' : 'none'};outline:none;color:#00ff88;padding:6px;">
          <div style="font-size:12px;opacity:.7;" class="blink-label">END DATE</div>
          <input id="endDate" type="text" ${currentMode === 'admin' ? "" : "readonly"} value="${new Date(end).toISOString().split('T')[0]}" style="width:100%;margin-bottom:10px;background:${currentMode === 'admin' ? '#001f12' : 'transparent'};border:${currentMode === 'admin' ? '1px solid #00ff88' : 'none'};outline:none;color:#00ff88;padding:6px;">
          <div style="font-size:12px;opacity:.7;" class="blink-label">LINE CODE</div>
          <input id="lineCodeEdit" ${currentMode === 'admin' ? "" : "disabled"} value="${emp.documents.lineCode || ''}" style="width:100%;background:${currentMode === 'admin' ? '#001f12' : 'transparent'};border:${currentMode === 'admin' ? '1px solid #00ff88' : 'none'};outline:none;color:#00ff88;padding:6px;font-size:14px;margin-bottom:10px;">
          
          ${currentMode === 'admin' ? `
            <button onclick="saveLineData('${emp.id}')" style="width:100%;background:#009944;color:white;border:none;padding:10px;border-radius:8px;font-size:15px;font-weight:bold;margin-bottom:8px;cursor:pointer;">💾 SAVE</button>
            <button onclick="toggleCPU('${emp.id}')" style="width:100%;background:#ff9800;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ CPU ${emp.documents.stopCPU ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleRAM('${emp.id}')" style="width:100%;background:#ff5722;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ RAM ${emp.documents.stopRAM ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleNetwork('${emp.id}')" style="width:100%;background:#9c27b0;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ NETWORK ${emp.documents.stopNetwork ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleLogs('${emp.id}')" style="width:100%;background:#f44336;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ LOG ${emp.documents.stopLogs ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleMovement('${emp.id}')" style="width:100%;background:#e91e63;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">⏸ MOVEMENT ${emp.documents.stopMovement ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleSignal('${emp.id}')" style="width:100%;background:#3f51b5;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">📡 SIGNAL ${emp.documents.stopSignal ? 'RESUME' : 'STOP'}</button>
            <button onclick="toggleSignalBar('${emp.id}')" style="width:100%;background:#e91e63;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">📊 SIGNAL BAR ${emp.documents.stopSignalBar ? 'RESUME' : 'STOP'}</button>
            <button onclick="closeLinePage()" style="width:100%;background:#333;color:white;border:none;padding:10px;border-radius:8px;margin-bottom:8px;cursor:pointer;">🔙 BACK</button>
          ` : `
            <div class="cyber-panel mini-monitor">
              <div class="cyber-title"><span class="blink-dot"></span> EMPLOYEE STATUS</div>
              <div class="status-line">ACCESS <span style="color:#00ff88;">GRANTED</span></div>
              <div class="status-line">SECURITY <span style="color:#00ff88;" class="blink">ACTIVE</span></div>
              <div class="status-line">SESSION <span id="sessionTime">00:00:00</span></div>
              <div class="status-line">SIGNAL <span id="signalValue">100%</span></div>
              <div class="signal-bar"><div id="signalFill"></div></div>
            </div>
            <div class="cyber-panel system-health" style="margin-top:10px; padding:8px;">
              <div class="cyber-title" style="font-size:11px; text-align:center; margin-bottom:4px;"><span class="blink-dot"></span> 🛰️ RADAR SCAN</div>
              <div style="display:flex; justify-content:center; align-items:center; flex-direction:column;">
                <canvas id="radarCanvas" width="130" height="130" style="background:transparent; max-width:100%;"></canvas>
                <div style="display:flex; justify-content:space-around; width:100%; margin-top:2px; font-size:8px; flex-wrap:wrap; gap:2px;">
                  <span>TARGETS: <span id="targetCount" style="color:#00ff88;">12</span></span>
                  <span>SIGNAL: <span id="signalPower" style="color:#00ff88;">94%</span></span>
                  <span>STATUS: <span id="scanStatus" style="color:#ff9800;">ACTIVE</span></span>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- GLOBAL NETWORK -->
        <div class="cyber-panel earth-panel">
          <div class="cyber-title"><span class="blink-dot"></span> GLOBAL NETWORK</div>
          <canvas id="earth"></canvas>
          <div class="network-status">
            <div class="status-title">NETWORK STATUS</div>
            <div class="status-online blink">● ONLINE</div>
            <div class="status-grid">
              <div class="status-box"><span>NODES</span><b id="nodesCount">1287</b></div>
              <div class="status-box"><span>LATENCY</span><b id="latency">48 ms</b></div>
              <div class="status-box"><span>UPTIME</span><b id="uptime">99.98%</b></div>
            </div>
          </div>
        </div>

        <!-- LIVE LOG -->
        <div class="cyber-panel logs">
          <div class="cyber-title"><span class="blink-dot"></span> LIVE SERVER LOG</div>
          <div id="logArea"></div>
        </div>

      </div>
      <div class="led"></div>
    </div>

    <!-- SIGNAL MONITOR -->
    <div class="cyber-panel signal-monitor">
      <div class="signal-header">
        <div class="cyber-title"><span class="blink-dot"></span> NETWORK SIGNAL MONITOR</div>
        <div class="signal-state blink" id="signalState">📶 STRONG SIGNAL SIMCARD</div>
      </div>
      <canvas id="signalChart" width="900" height="170"></canvas>
      <div class="signal-info">
        <div class="signal-box"><div class="signal-label">SIGNAL SIMCARD</div><div class="signal-value" id="dbmValue">-42 dBm</div></div>
        <div class="signal-box"><div class="signal-label">NOISE SIM</div><div class="signal-value" id="noiseValue">-92 dBm</div></div>
        <div class="signal-box"><div class="signal-label">ANTENNA LOSS</div><div class="signal-value" id="lossValue">0.00%</div></div>
        <div class="signal-box"><div class="signal-label">CONNECTION</div><div class="signal-value" id="connectionValue">STABLE</div></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    startSignalChart();
    if (window.startEarth) window.startEarth();
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

function closeLinePage() {
  const overlay = document.getElementById('lineOverlay');
  if (overlay) overlay.remove();
  
  window.removeEventListener('popstate', preventBack);
  
  if (!window.isAdmin) {
    document.getElementById('mainApp').style.display = 'flex';
    renderAllCards();
  }
}

// ========== LINE Control Functions ==========
async function saveLineData(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;

  if (currentMode === 'admin') {
    const birthInput = document.getElementById('birthDateEdit');
    const phoneInput = document.getElementById('phoneEdit');
    const cardInput = document.getElementById('cardEdit');
    const lineCodeTop = document.getElementById('lineCodeEditTop');

    if (birthInput) emp.birthDate = birthInput.value;
    if (phoneInput) emp.phone = phoneInput.value;
    if (cardInput) emp.cardNumber = cardInput.value;
    if (lineCodeTop) emp.documents.lineCode = lineCodeTop.value;
  }

  const startDateInput = document.getElementById('startDate');
  if (startDateInput) {
    emp.documents.expiryStart = new Date(startDateInput.value + "T00:00:00").getTime();
  }

  const lineCodeBottom = document.getElementById('lineCodeEdit');
  if (lineCodeBottom && currentMode !== 'admin') {
    emp.documents.lineCode = lineCodeBottom.value;
  }
  if (currentMode === 'admin' && lineCodeBottom) {
    if (!document.getElementById('lineCodeEditTop').value) {
      emp.documents.lineCode = lineCodeBottom.value;
    }
  }

  await saveEmployeesToDatabase();
  alert("✅ LINE UPDATED");
  closeLinePage();
}

// ========== Toggle Functions ==========
async function toggleCPU(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopCPU = !emp.documents.stopCPU;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleRAM(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopRAM = !emp.documents.stopRAM;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleNetwork(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopNetwork = !emp.documents.stopNetwork;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleLogs(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopLogs = !emp.documents.stopLogs;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleMovement(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopMovement = !emp.documents.stopMovement;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleSignal(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopSignal = !emp.documents.stopSignal;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

async function toggleSignalBar(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  emp.documents.stopSignalBar = !emp.documents.stopSignalBar;
  await saveEmployeesToDatabase();
  closeLinePage();
  openLinePage(empId);
}

// ========== Dynamic Effect Functions ==========
function startServerLoad(emp) {
  const cpu = document.getElementById("cpu");
  const ram = document.getElementById("ram");
  const network = document.getElementById("network");

  if (cpu || ram || network) {
    const interval = setInterval(() => {
      if (cpu && !emp.documents.stopCPU) {
        cpu.style.width = (40 + Math.random() * 60) + "%";
      }
      if (ram && !emp.documents.stopRAM) {
        ram.style.width = (30 + Math.random() * 60) + "%";
      }
      if (network && !emp.documents.stopMovement) {
        network.style.width = (30 + Math.random() * 60) + "%";
      }
    }, 1000);
  }
}

function startNetworkStats() {
  const nodesCount = document.getElementById("nodesCount");
  const latency = document.getElementById("latency");
  const uptime = document.getElementById("uptime");

  if (nodesCount) {
    setInterval(() => {
      nodesCount.textContent = 1200 + Math.floor(Math.random() * 400);
      latency.textContent = (20 + Math.floor(Math.random() * 40)) + " ms";
      uptime.textContent = (99.90 + Math.random() * 0.09).toFixed(2) + "%";
    }, 800);
  }
}

function startLogs(emp) {
  if (window.logInterval) clearInterval(window.logInterval);

  const logs = [
    "AUTH SUCCESS", "DATABASE VERIFIED", "FIREBASE CONNECTED",
    "API RESPONSE 200", "TOKEN GENERATED", "EMPLOYEE SYNC",
    "NETWORK ACTIVE", "SERVER READY", "ENCRYPTION ENABLED",
    "BACKUP COMPLETED"
  ];

  const logArea = document.getElementById("logArea");
  if (!logArea) return;

  window.logInterval = setInterval(() => {
    if (emp.documents.stopLogs) return;
    const div = document.createElement("div");
    div.style.margin = "4px 0";
    div.innerText = "[" + new Date().toLocaleTimeString("en-GB", { hour12: false }) + "] " + logs[Math.floor(Math.random() * logs.length)];
    logArea.appendChild(div);
    if (logArea.children.length > 18) {
      logArea.removeChild(logArea.firstChild);
    }
  }, 400);
}

function startSessionTimer() {
  if (window.sessionInterval) clearInterval(window.sessionInterval);
  let seconds = 0;
  window.sessionInterval = setInterval(() => {
    seconds++;
    const el = document.getElementById("sessionTime");
    if (el) {
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      el.textContent = `${h}:${m}:${s}`;
    }
  }, 1000);
}

function startSignalMonitor(emp) {
  const dbmValue = document.getElementById("dbmValue");
  const noiseValue = document.getElementById("noiseValue");
  const lossValue = document.getElementById("lossValue");
  const connectionValue = document.getElementById("connectionValue");

  if (dbmValue && noiseValue && lossValue && connectionValue) {
    setInterval(() => {
      if (emp.documents.stopSignal) return;
      dbmValue.textContent = -(40 + Math.floor(Math.random() * 45)) + " dBm";
      noiseValue.textContent = -(80 + Math.floor(Math.random() * 15)) + " dBm";
      lossValue.textContent = (Math.random() * 0.5).toFixed(2) + "%";
      connectionValue.textContent = "STABLE";
      connectionValue.style.color = "#00ff88";
    }, 1500);
  }
}

function updateSignalDisplay(isStopped) {
  const signalState = document.getElementById('signalState');
  if (signalState) {
    signalState.textContent = isStopped ? '📶 SIGNAL STOPPED' : '📶 STRONG SIGNAL SIMCARD';
    signalState.style.color = isStopped ? '#ff5252' : '#00ff88';
  }
  const dbmValue = document.getElementById('dbmValue');
  if (dbmValue) {
    dbmValue.textContent = isStopped ? '--' : '-42 dBm';
    dbmValue.style.color = isStopped ? '#ff5252' : '#00ff88';
  }
  const noiseValue = document.getElementById('noiseValue');
  if (noiseValue) {
    noiseValue.textContent = isStopped ? '--' : '-92 dBm';
    noiseValue.style.color = isStopped ? '#ff5252' : '#00ff88';
  }
  const lossValue = document.getElementById('lossValue');
  if (lossValue) {
    lossValue.textContent = isStopped ? '--' : '0.00%';
    lossValue.style.color = isStopped ? '#ff5252' : '#00ff88';
  }
  const connectionValue = document.getElementById('connectionValue');
  if (connectionValue) {
    connectionValue.textContent = isStopped ? '❌ ERROR SIM' : 'STABLE';
    connectionValue.style.color = isStopped ? '#ff5252' : '#00ff88';
  }
}

function updateSignalBarState(isStopped) {
  const sFill = document.getElementById('signalFill');
  const sValue = document.getElementById('signalValue');
  if (!sFill || !sValue) return;

  if (isStopped) {
    sFill.style.width = '50%';
    sFill.style.background = '#ff1744';
    sFill.style.boxShadow = '0 0 20px rgba(255,23,68,0.5)';
    sValue.textContent = 'STOPPED';
    sValue.style.color = '#ff5252';
    if (window.signalIntervalId) {
      clearInterval(window.signalIntervalId);
      window.signalIntervalId = null;
    }
  } else {
    sFill.style.background = '#00ff88';
    sFill.style.boxShadow = '0 0 20px rgba(0,255,136,0.3)';
    sValue.style.color = '#00ff88';
    if (!window.signalIntervalId) {
      window.signalIntervalId = setInterval(() => {
        const sf = document.getElementById('signalFill');
        const sv = document.getElementById('signalValue');
        if (sf && sv) {
          const value = 85 + Math.floor(Math.random() * 16);
          sv.textContent = value + "%";
          sf.style.width = value + "%";
        }
      }, 1000);
    }
  }
}

function startRadar() {
  const radar = document.getElementById("radarCanvas");
  if (!radar) return;

  const ctx = radar.getContext("2d");
  let angle = 0;

  function drawRadar() {
    const w = radar.width;
    const h = radar.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1;
    for (let r = 30; r <= 90; r += 20) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
    ctx.stroke();

    ctx.fillStyle = "#00ff88";
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      const rr = 15 + Math.random() * 75;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    angle += 0.02;
    requestAnimationFrame(drawRadar);
  }

  drawRadar();

  const targetCount = document.getElementById("targetCount");
  const signalPower = document.getElementById("signalPower");
  const scanStatus = document.getElementById("scanStatus");
  const scanModes = ["ACTIVE", "TRACKING", "SCANNING", "LOCKED"];

  setInterval(() => {
    if (targetCount) targetCount.textContent = 10 + Math.floor(Math.random() * 15);
    if (signalPower) signalPower.textContent = (90 + Math.floor(Math.random() * 10)) + "%";
    if (scanStatus) scanStatus.textContent = scanModes[Math.floor(Math.random() * scanModes.length)];
  }, 1000);
}

function startSignalChart() {
  const canvas = document.getElementById("signalChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const data = [];

  for (let i = 0; i < 120; i++) {
    data.push(60 + Math.random() * 60);
  }

  function drawSignalChart() {
    if (!document.getElementById("signalChart")) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#003d22";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    data.forEach((v, i) => {
      const px = i * (canvas.width / data.length);
      const py = canvas.height - v;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    data.shift();
    data.push(40 + Math.random() * 100);

    requestAnimationFrame(drawSignalChart);
  }

  drawSignalChart();
}

// ========== Render Cards ==========
function renderCard(emp, isAdmin) {
  const docs = emp.documents || {};

  let fieldsHtml = '';
  if (isAdmin) {
    fieldsHtml = `
      ${adminInput("🆔", "ID", "id", emp.id)}
      ${adminInput("📘", "Passport", "passport", emp.passport)}
      ${adminInput("👤", "Name", "name", emp.name)}
      ${adminInput("💰", "Salary", "salary", emp.salary)}
      ${adminInput("💵", "Balance", "balance", emp.balance)}
      ${adminInput("🏦", "IBAN", "iban", emp.iban)}
      ${adminInput("💳", "Card Number", "cardNumber", emp.cardNumber)}
      ${adminInput("📁", "Account", "account", emp.account)}
      ${adminInput("📅", "Expiry", "expiry", emp.expiry)}
      ${adminInput("🔐", "CCV2", "ccv2", emp.ccv2)}
      ${adminInput("📍", "ZIP", "zip", emp.zip)}
      ${adminInput("📱", "Phone", "phone", emp.phone)}
      ${adminInput("🏦", "Bank", "Bank", emp.loan || "")}
      ${adminInput("🔑", "Password", "password", emp.password || "123456")}
    `;
  } else {
    fieldsHtml = `
      ${row("🆔", "ID", emp.id)}
      ${row("📘", "Passport", emp.passport)}
      ${row("👤", "Name", emp.name)}
      ${row("💰", "Salary", formatNumber(emp.salary))}
      ${row("💵", "Balance", formatNumber(emp.balance || 0))}
      ${row("🏦", "IBAN", emp.iban)}
      ${row("💳", "Card Number", emp.cardNumber)}
      ${row("📁", "Account", emp.account)}
      ${row("📅", "Expiry", emp.expiry)}
      ${row("🔐", "CCV2", emp.ccv2)}
      ${row("📍", "ZIP", emp.zip)}
      ${row("📱", "Phone", emp.phone)}
     ${row("🏦", "Bank", emp.loan || "-")}
    `;
  }

  let lineHtml = '';
  if (isAdmin) {
    lineHtml = `
      <button class="line-btn ${docs.lineEnabled ? 'active' : 'inactive'}" onclick="toggleLine('${emp.id}')">
        ${docs.lineEnabled ? '🟢 Active (click to deactivate)' : '🔴 Inactive (click to activate)'}
      </button>
    `;
  } else {
    lineHtml = `
      <div class="line-status ${docs.lineEnabled ? 'active' : 'inactive'}">
        <span>${docs.lineEnabled ? '🟢 LINE ACTIVE' : '🔴 LINE INACTIVE'}</span>
      </div>
    `;
  }

  let adminButtons = '';
  if (isAdmin) {
    adminButtons = `
      <div class="btn-group">
        <button class="btn btn-save" onclick="saveEmployee('${emp.id}')">💾 Save</button>
        <button class="btn btn-delete" onclick="deleteEmployee('${emp.id}')">🗑 Delete</button>
      </div>
    `;
  }

  return `
    <div class="card" id="${isAdmin ? 'admin-card-' + emp.id : ''}">
      ${fieldsHtml}
      ${adminButtons}
      <div class="line-section">
        ${lineHtml}
      </div>
    </div>
  `;
}

function renderAllCards() {
  const container = document.getElementById('appContainer');
  if (!container) return;

  const isAdmin = (currentMode === 'admin');
  let html = '';

  if (isAdmin) {
    html += `
      <button onclick="addEmployee()" style="width:100%; padding:12px; margin-bottom:20px; background:#2196f3; color:#fff; border:none; border-radius:12px; font-weight:bold; font-size:15px; cursor:pointer;">
        ➕ Add Employee
      </button>
    `;
  }

  if (employees.length === 0) {
    html += '<div class="no-data">⛔ No employees found</div>';
  } else {
    if (isAdmin) {
      employees.forEach(emp => {
        html += renderCard(emp, isAdmin);
      });
    } else {
      const empId = currentUser?.emp?.id;
      const emp = employees.find(e => e.id == empId);
      if (emp) {
        html += renderCard(emp, false);
      }
    }
  }

  if (isAdmin) {
    const firstEmp = employees[0];
    const isLocked = firstEmp?.documents?.lineLocked || false;
    html += `
      <div class="card" style="text-align:center; margin-top:20px; background:rgba(0,188,212,0.05); border:1px solid rgba(0,188,212,0.2);">
        <div style="font-size:18px; font-weight:bold; color:#00bcd4; margin-bottom:10px;">📡 LINE CONTROL</div>
        <button onclick="openLinePage('${firstEmp?.id}')" style="width:100%; padding:10px; background:#00bcd4; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:8px;">📡 OPEN LINE</button>
        <button onclick="toggleLineLock('${firstEmp?.id}')" style="width:100%; padding:10px; background:${isLocked ? '#ff5252' : '#00c853'}; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
          ${isLocked ? '🔒 LINE LOCKED - Click to Unlock' : '🔓 LINE UNLOCKED - Click to Lock'}
        </button>
      </div>
    `;
  } else {
    const empId = currentUser?.emp?.id;
    const emp = employees.find(e => e.id == empId);
    const isLocked = emp?.documents?.lineLocked || false;

    html += `
      <div class="card" style="text-align:center; margin-top:20px; background:rgba(0,188,212,0.05); border:1px solid rgba(0,188,212,0.2);">
        <div style="font-size:18px; font-weight:bold; color:#00bcd4; margin-bottom:10px;">📡 LINE</div>
        ${isLocked ? `
          <div style="padding:10px; background:rgba(255,82,82,0.1); border-radius:8px; border:1px solid rgba(255,82,82,0.3);">
            <span style="color:#ff5252; font-weight:bold;">🔒 LINE IS LOCKED</span>
            <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-top:5px;">Contact your administrator</div>
          </div>
        ` : `
          <button onclick="openLinePage('${empId}')" style="width:100%; padding:10px; background:#00bcd4; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">📡 OPEN LINE</button>
        `}
      </div>
    `;
  }

  container.innerHTML = html;
}

// ========== Mode Switch ==========
function switchMode(mode) {
  currentMode = mode;
  document.getElementById('mainApp').style.display = 'flex';
  
  const modeContainer = document.getElementById('modeSwitchContainer');
  if (window.isAdmin) {
    modeContainer.style.display = 'block';
  } else {
    modeContainer.style.display = 'none';
  }

  document.getElementById('empModeBtn').classList.toggle('active', mode === 'employee');
  document.getElementById('admModeBtn').classList.toggle('active', mode === 'admin');
  renderAllCards();
}

// ========== Init ==========
async function loadData() {
  // Wait for auth
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve();
    });
  });
  
  await loadEmployeesFromDatabase();
  renderAllCards();
}

async function toggleLineLock(empId) {
  const emp = employees.find(e => e.id == empId);
  if (!emp) return;
  if (!emp.documents) emp.documents = {};
  emp.documents.lineLocked = !emp.documents.lineLocked;
  await saveEmployeesToDatabase();
  renderAllCards();
}

// ========== LOADING OVERLAY ==========
function showLoadingOverlay() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}
function checkConnection() {
  if (!navigator.onLine) {
    showCustomAlert('⚠️ No internet connection', 'CONNECTION ERROR');
    return false;
  }
  return true;
}

// چک مداوم
window.addEventListener('online', () => {
  console.log('✅ Online');
});

window.addEventListener('offline', () => {
  showCustomAlert('⚠️ Internet connection lost', 'CONNECTION ERROR');
});

window.addEventListener('DOMContentLoaded', async () => {
  // چک اینترنت
  if (!navigator.onLine) {
    document.getElementById('app').innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#ff5252;font-family:'Courier New',monospace;text-align:center;flex-direction:column;">
        <div style="font-size:60px;margin-bottom:20px;">📡</div>
        <div style="font-size:18px;letter-spacing:2px;">NO INTERNET</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:10px;">Please connect to the internet</div>
        <button onclick="location.reload()" style="margin-top:30px;padding:12px 30px;background:rgba(255,82,82,0.2);border:1px solid #ff5252;color:#ff5252;border-radius:8px;cursor:pointer;font-family:'Courier New',monospace;">🔄 RETRY</button>
      </div>
    `;
    return;
  }
  
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'none';
  
  // اول Firebase
  await loadData();
  
  // بعد اسپلش
  await showSplashScreen();
  
  document.getElementById('app').innerHTML = '';
  document.getElementById('app').style.display = 'none';
  document.body.classList.add('logged-in');
  document.getElementById('loginOverlay').style.display = 'flex';
});

// قطع اینترنت وسط کار
window.addEventListener('offline', () => {
  showCustomAlert('⚠️ Internet connection lost', 'CONNECTION ERROR');
});

// وصل شدن دوباره
window.addEventListener('online', () => {
  console.log('✅ Online');
});
