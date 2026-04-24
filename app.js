// ============================================================
//  AutoVault India — Main Application Logic
// ============================================================

let currentUser = null;
let selectedVehicle = null;
let otpSent = false;
let generatedOTP = null;
let otpTimer = null;
let filterActive = "all";

// ── Auth State ────────────────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  updateHeader(user);
  if (user && isAdmin(user.email)) {
    window.location.href = "pages/admin.html";
  }
});

function updateHeader(user) {
  const btn = document.getElementById("googleLoginBtn");
  if (!btn) return;
  if (user) {
    btn.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/18'}" width="18" style="border-radius:50%" alt=""/>  ${user.displayName?.split(" ")[0] || "User"} — View Bookings`;
    btn.onclick = () => window.location.href = "pages/dashboard.html";
  } else {
    btn.innerHTML = `<img src="https://www.google.com/favicon.ico" width="18" alt="G"/> Continue with Google`;
    btn.onclick = loginWithGoogle;
  }
}

// ── Google Login ──────────────────────────────────────────────
async function loginWithGoogle() {
  try {
    showToast("Redirecting to Google...", "info");
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    await db.collection("users").doc(user.uid).set({
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      phone: user.phoneNumber || "",
      role: isAdmin(user.email) ? "admin" : "user",
      joinedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    showToast(`Welcome, ${user.displayName?.split(" ")[0]}! 🎉`, "success");
    if (isAdmin(user.email)) {
      setTimeout(() => window.location.href = "pages/admin.html", 800);
    } else {
      updateHeader(user);
    }
  } catch (err) {
    showToast("Login failed: " + err.message, "error");
  }
}

// ── Render Vehicles ───────────────────────────────────────────
function renderVehicles(filter = "all") {
  const grid = document.getElementById("vehiclesGrid");
  if (!grid) return;
  const filtered = filter === "all" ? VEHICLES : VEHICLES.filter(v => v.category === filter);
  grid.innerHTML = filtered.map(v => `
    <div class="vehicle-card glass animate-in" data-cat="${v.category}">
      <div class="card-badge" style="background:${v.color}20;color:${v.color};border:1px solid ${v.color}40">${v.badge}</div>
      <div class="card-img-wrap">
        <img src="${v.image}" alt="${v.name}" class="card-img" 
             onerror="this.src='https://via.placeholder.com/400x220/0a0a1a/00d4ff?text=${encodeURIComponent(v.name)}'" 
             loading="lazy"/>
        <div class="card-img-overlay" style="background:linear-gradient(to top, #080818, transparent)"></div>
      </div>
      <div class="card-body">
        <div class="card-brand">${v.brand}</div>
        <h3 class="card-name">${v.name}</h3>
        <p class="card-desc">${v.desc}</p>
        <div class="card-specs">
          <div class="spec"><span class="spec-val">${v.range}km</span><span class="spec-key">Range</span></div>
          <div class="spec"><span class="spec-val">${v.topSpeed}</span><span class="spec-key">km/h</span></div>
          <div class="spec"><span class="spec-val">${v.charge0to80}min</span><span class="spec-key">0→80%</span></div>
          <div class="spec"><span class="spec-val">${v.seats}</span><span class="spec-key">Seats</span></div>
        </div>
        <div class="card-footer">
          <div class="card-price">₹${v.price} <span class="price-unit">Lakh</span></div>
          <button class="btn-book" onclick="openBooking('${v.id}')" style="--accent:${v.color}">
            Pre-Book Now
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

// ── Filter ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderVehicles();
  initParticles();

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderVehicles(btn.dataset.filter);
    });
  });
});

// ── Booking Modal ─────────────────────────────────────────────
function openBooking(vehicleId) {
  if (!currentUser) {
    showToast("Please sign in with Google to book!", "warning");
    loginWithGoogle();
    return;
  }
  selectedVehicle = VEHICLES.find(v => v.id === vehicleId);
  if (!selectedVehicle) return;

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-step" id="step1">
      <div class="modal-car-img">
        <img src="${selectedVehicle.image}" alt="${selectedVehicle.name}" 
             onerror="this.src='https://via.placeholder.com/400x200/0a0a1a/00d4ff?text=${encodeURIComponent(selectedVehicle.name)}'"/>
      </div>
      <h2 class="modal-title">Pre-Book <span class="gradient-text">${selectedVehicle.name}</span></h2>
      <p class="modal-price">₹${selectedVehicle.price} Lakh onwards</p>
      <div class="modal-user-info">
        <img src="${currentUser.photoURL || ''}" width="40" style="border-radius:50%" onerror="this.style.display='none'"/>
        <div>
          <b>${currentUser.displayName}</b><br/>
          <small>${currentUser.email}</small>
        </div>
      </div>
      <div class="form-group">
        <label>Your Mobile Number</label>
        <div class="phone-input">
          <span class="phone-prefix">🇮🇳 +91</span>
          <input type="tel" id="phoneInput" placeholder="98765 43210" maxlength="10" 
                 oninput="this.value=this.value.replace(/\D/g,'')"/>
        </div>
      </div>
      <div class="form-group">
        <label>Preferred Color</label>
        <select id="colorSelect">
          <option>Lunar Silver</option>
          <option>Midnight Black</option>
          <option>Daytona Red</option>
          <option>Ocean Blue</option>
          <option>Pristine White</option>
          <option>Flame Orange</option>
        </select>
      </div>
      <div class="form-group">
        <label>City</label>
        <select id="citySelect">
          <option>Mumbai</option><option>Delhi</option><option>Bengaluru</option>
          <option>Chennai</option><option>Hyderabad</option><option>Pune</option>
          <option>Kolkata</option><option>Ahmedabad</option><option>Jaipur</option>
          <option>Surat</option><option>Lucknow</option><option>Kochi</option>
        </select>
      </div>
      <button class="btn-primary full-width" onclick="sendOTP()">
        📱 Send OTP to Verify
      </button>
    </div>

    <div class="modal-step" id="step2" style="display:none">
      <div class="otp-icon">🔐</div>
      <h2 class="modal-title">Verify OTP</h2>
      <p class="otp-desc">A 6-digit OTP has been sent to<br/><b id="phoneDisplay"></b></p>
      <div class="otp-input-row" id="otpInputs">
        <input class="otp-box" maxlength="1" oninput="otpNext(this,0)" type="text" inputmode="numeric"/>
        <input class="otp-box" maxlength="1" oninput="otpNext(this,1)" type="text" inputmode="numeric"/>
        <input class="otp-box" maxlength="1" oninput="otpNext(this,2)" type="text" inputmode="numeric"/>
        <input class="otp-box" maxlength="1" oninput="otpNext(this,3)" type="text" inputmode="numeric"/>
        <input class="otp-box" maxlength="1" oninput="otpNext(this,4)" type="text" inputmode="numeric"/>
        <input class="otp-box" maxlength="1" oninput="otpNext(this,5)" type="text" inputmode="numeric"/>
      </div>
      <div class="otp-timer" id="otpTimerDisplay">OTP valid for <span id="timerCount">120</span>s</div>
      <div class="otp-hint glass" style="margin:12px 0;padding:10px 14px;border-radius:8px;font-size:0.85rem;color:#facc15">
        🔔 Demo Mode: OTP is shown in console (F12). In production, integrate SMS service.
      </div>
      <button class="btn-primary full-width" onclick="verifyOTP()">✅ Verify & Confirm Booking</button>
      <button class="btn-ghost full-width" onclick="resendOTP()" id="resendBtn" disabled>Resend OTP</button>
    </div>

    <div class="modal-step" id="step3" style="display:none">
      <div class="success-animation">
        <div class="success-ring"></div>
        <div class="success-check">✓</div>
      </div>
      <h2 class="modal-title gradient-text">Booking Confirmed!</h2>
      <div class="booking-summary glass" id="bookingSummary"></div>
      <button class="btn-primary full-width" onclick="window.location.href='pages/dashboard.html'">
        View My Bookings →
      </button>
      <button class="btn-ghost full-width" onclick="closeModal()">Close</button>
    </div>
  `;
  document.getElementById("bookingModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
  if (otpTimer) clearInterval(otpTimer);
  otpSent = false; generatedOTP = null;
}

// ── OTP Flow ─────────────────────────────────────────────────
function sendOTP() {
  const phone = document.getElementById("phoneInput").value;
  if (phone.length !== 10) {
    showToast("Enter a valid 10-digit mobile number", "error");
    return;
  }
  // Generate 6-digit OTP
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`%c🔐 AutoVault OTP: ${generatedOTP}`, "background:#00d4ff;color:#000;font-size:20px;padding:4px 8px;border-radius:4px");

  // Show step 2
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
  document.getElementById("phoneDisplay").textContent = "+91 " + phone;

  // Start timer
  let seconds = 120;
  const timerEl = document.getElementById("timerCount");
  const resendBtn = document.getElementById("resendBtn");
  otpTimer = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(otpTimer);
      if (resendBtn) resendBtn.disabled = false;
      if (timerEl) timerEl.parentElement.textContent = "OTP expired. Click resend.";
    }
  }, 1000);

  showToast("OTP sent! Check console (F12) for demo OTP 🔐", "success");
  otpSent = true;
}

function resendOTP() {
  sendOTP();
  document.getElementById("resendBtn").disabled = true;
}

function otpNext(input, index) {
  input.value = input.value.replace(/\D/g, "");
  if (input.value.length === 1) {
    const boxes = document.querySelectorAll(".otp-box");
    if (index < 5) boxes[index + 1].focus();
  }
}

async function verifyOTP() {
  const boxes = document.querySelectorAll(".otp-box");
  const entered = Array.from(boxes).map(b => b.value).join("");
  if (entered.length < 6) {
    showToast("Enter all 6 digits", "error"); return;
  }
  if (entered !== generatedOTP) {
    showToast("Invalid OTP. Try again!", "error");
    boxes.forEach(b => { b.value = ""; b.classList.add("shake"); });
    setTimeout(() => boxes.forEach(b => b.classList.remove("shake")), 500);
    boxes[0].focus();
    return;
  }

  // Booking confirmed — save to Firestore
  const phone = document.getElementById("phoneDisplay").textContent;
  const color = document.getElementById("colorSelect")?.value || "Lunar Silver";
  const city = document.getElementById("citySelect")?.value || "Mumbai";
  const bookingId = "AVB" + Date.now().toString().slice(-8);

  const booking = {
    bookingId,
    vehicleId: selectedVehicle.id,
    vehicleName: selectedVehicle.name,
    vehicleBrand: selectedVehicle.brand,
    vehicleImage: selectedVehicle.image,
    vehiclePrice: selectedVehicle.price,
    color, city, phone,
    userId: currentUser.uid,
    userName: currentUser.displayName,
    userEmail: currentUser.email,
    status: "Confirmed",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("bookings").doc(bookingId).set(booking);
    clearInterval(otpTimer);
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    document.getElementById("bookingSummary").innerHTML = `
      <table class="summary-table">
        <tr><td>Booking ID</td><td><b>${bookingId}</b></td></tr>
        <tr><td>Vehicle</td><td>${selectedVehicle.name}</td></tr>
        <tr><td>Price</td><td>₹${selectedVehicle.price} Lakh</td></tr>
        <tr><td>Color</td><td>${color}</td></tr>
        <tr><td>City</td><td>${city}</td></tr>
        <tr><td>Mobile</td><td>${phone}</td></tr>
        <tr><td>Status</td><td><span style="color:#22c55e">✅ Confirmed</span></td></tr>
      </table>
    `;
    showToast("Booking confirmed successfully! 🎉", "success");
  } catch (err) {
    showToast("Error saving booking: " + err.message, "error");
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast toast-${type} show`;
  setTimeout(() => t.classList.remove("show"), 3500);
}

// ── Particles ─────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById("particles");
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const dot = document.createElement("div");
    dot.className = "particle";
    dot.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-delay:${Math.random()*6}s;
      animation-duration:${4 + Math.random()*6}s;
      width:${1 + Math.random()*2}px;
      height:${1 + Math.random()*2}px;
      opacity:${0.2 + Math.random()*0.5}
    `;
    container.appendChild(dot);
  }
}

// Close modal on overlay click
document.getElementById("bookingModal")?.addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});
