// Firebase Modular v12
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyABrYDmJ53ZyKiW1uGkp727FxwPEENaKNs",
  authDomain: "database-d8ec1.firebaseapp.com",
  projectId: "database-d8ec1",
  storageBucket: "database-d8ec1.firebasestorage.app",
  messagingSenderId: "521321838381",
  appId: "1:521321838381:web:0c65d78ce797072c88c5a4",
  measurementId: "G-T67XCL4NCQ"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ========== Inisialisasi elemen ========== //
const invitation = document.getElementById("invitation");
const guestNameSpots = document.querySelectorAll("#guest-name, #guest-name-2");
const bgMusic = document.getElementById("bg-music");

const params = new URLSearchParams(window.location.search);
const nameParam = params.get("to");
const decodedName = nameParam ? decodeURIComponent(nameParam.replace(/\+/g, ' ')) : "Tamu Undangan";

// Tampilkan nama tamu di elemen
guestNameSpots.forEach(el => el.textContent = decodedName);

// Fungsi buka undangan
window.openInvitation = function () {
  document.getElementById("cover").style.display = "none";
  invitation.style.display = "block";

  if (bgMusic) {
    bgMusic.play().catch(() => {
      console.log("User interaction required to play music.");
    });
  }

  startLeafFallLoop();
};

// Efek daun jatuh
function createFallingLeaf() {
  const leaf = document.createElement("div");
  leaf.classList.add("leaf");
  leaf.style.left = Math.random() * window.innerWidth + "px";
  leaf.style.animationDuration = 5 + Math.random() * 5 + "s";
  leaf.style.opacity = Math.random();
  document.body.appendChild(leaf);

  setTimeout(() => leaf.remove(), 10000);
}

function startLeafFallLoop() {
  setInterval(createFallingLeaf, 600);
}

// Countdown
const weddingDate = new Date("2025-08-10T08:00:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;

  if (distance < 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerHTML = "<p>Acara telah selesai 💍</p>";
  }
}

const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

// =====================
// Form RSVP dan Firebase
// =====================
const form = document.getElementById("rsvp-form");
const hadirCount = document.getElementById("hadir-count");
const tidakHadirCount = document.getElementById("tidak-hadir-count");
const commentList = document.getElementById("comment-list");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const attendance = document.getElementById("attendance").value;
  const message = document.getElementById("message").value.trim();

  if (!name || !attendance) {
    alert("Silakan lengkapi nama dan kehadiran.");
    return;
  }

  await addDoc(collection(db, "rsvp"), {
    name,
    attendance,
    message,
    timestamp: Date.now()
  });

  form.reset();
  loadStats();
  loadComments();
});

// Tampilkan jumlah hadir / tidak hadir
async function loadStats() {
  const snapshot = await getDocs(collection(db, "rsvp"));
  let hadir = 0, tidak = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.attendance === "hadir") hadir++;
    if (data.attendance === "tidak_hadir") tidak++;
  });

  hadirCount.textContent = hadir;
  tidakHadirCount.textContent = tidak;
}

// Tampilkan komentar ucapan
async function loadComments() {
  commentList.innerHTML = "";
  const q = query(collection(db, "rsvp"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.message) {
      const li = document.createElement("li");
      const symbol = data.attendance === "hadir" ? "✅" : "❌";
      const date = new Date(data.timestamp);
      const timeStr = date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
      li.innerHTML = `
        <div style="border-bottom:1px solid #ccc; padding:10px 0;">
          <strong>${data.name} ${symbol}</strong><br/>
          <p>${data.message}</p>
          <small>${timeStr} <button onclick="alert('fitur balas belum aktif')">Balas</button></small>
        </div>
      `;
      commentList.appendChild(li);
    }
  });
}

// Load data awal saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadComments();
});
