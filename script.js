// Inisialisasi elemen
const invitation = document.getElementById("invitation");
const guestNameSpots = document.querySelectorAll("#guest-name, #guest-name-2");
const bgMusic = document.getElementById("bg-music");

// Ambil nama tamu dari URL (?to=Nama+Tamu)
const params = new URLSearchParams(window.location.search);
const name = params.get("to");
const decodedName = name ? decodeURIComponent(name.replace(/\+/g, ' ')) : "Tamu Undangan";

// Tampilkan nama
guestNameSpots.forEach(el => el.textContent = decodedName);

// Fungsi membuka undangan
function openInvitation() {
  document.getElementById("cover").style.display = "none";
  invitation.style.display = "block";

  // Mainkan musik
  if (bgMusic) {
    bgMusic.play().catch(() => {
      console.log("User interaction required to play music.");
    });
  }

  // Mulai efek daun jatuh
  startLeafFallLoop();
}

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
  setInterval(() => {
    createFallingLeaf();
  }, 600);
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

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyABrYDmJ53ZyKiW1uGkp727FxwPEENaKNs",
  authDomain: "database-d8ec1.firebaseapp.com",
  projectId: "database-d8ec1",
  storageBucket: "database-d8ec1.firebasestorage.app",
  messagingSenderId: "521321838381",
  appId: "1:521321838381:web:0c65d78ce797072c88c5a4",
  measurementId: "G-T67XCL4NCQ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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

  await db.collection("rsvp").add({
    name,
    attendance,
    message,
    timestamp: Date.now(),
    replies: []
  });

  form.reset();
  loadStats();
  loadComments();
});

async function loadStats() {
  const snapshot = await db.collection("rsvp").get();
  let hadir = 0, tidak = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.attendance === "hadir") hadir++;
    if (data.attendance === "tidak_hadir") tidak++;
  });
  hadirCount.textContent = hadir;
  tidakHadirCount.textContent = tidak;
}

let currentPage = 1;
const perPage = 5;

async function loadComments(page = 1) {
  commentList.innerHTML = "";
  const snapshot = await db.collection("rsvp").orderBy("timestamp", "desc").get();
  const docs = snapshot.docs;
  const total = docs.length;
  const start = (page - 1) * perPage;
  const end = page * perPage;
  const visibleDocs = docs.slice(start, end);

  visibleDocs.forEach(doc => {
    const data = doc.data();
    const date = new Date(data.timestamp).toLocaleString();
    const symbol = data.attendance === "hadir" ? "✅" : "❌";

    const li = document.createElement("li");
    li.innerHTML = `
      <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
        <div style="display: flex; justify-content: space-between;">
          <strong>${data.name} ${symbol}</strong>
          <small>${date}</small>
        </div>
        <div style="margin-top: 5px;">${data.message || "(Tidak ada ucapan)"}</div>
        <div style="margin-top: 5px;">
          <button onclick="replyToComment('${doc.id}')">Reply</button>
        </div>
        <ul id="replies-${doc.id}" style="margin-top: 5px; padding-left: 15px;"></ul>
      </div>
    `;
    commentList.appendChild(li);
    loadReplies(doc.id, data.replies || []);
  });

  renderPagination(total);
}

function renderPagination(total) {
  const pageNav = document.getElementById("pagination");
  pageNav.innerHTML = "";
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => {
      currentPage--;
      loadComments(currentPage);
    };
    pageNav.appendChild(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => {
      currentPage++;
      loadComments(currentPage);
    };
    pageNav.appendChild(nextBtn);
  }
}

async function replyToComment(commentId) {
  const reply = prompt("Tulis balasan Anda:");
  if (!reply) return;

  const commentRef = db.collection("rsvp").doc(commentId);
  const doc = await commentRef.get();
  const data = doc.data();

  const replies = data.replies || [];
  replies.push({ text: reply, timestamp: Date.now() });

  await commentRef.update({ replies });
  loadComments(currentPage);
}

function loadReplies(id, replies) {
  const replyList = document.getElementById(`replies-${id}`);
  replies.forEach(reply => {
    const li = document.createElement("li");
    const time = new Date(reply.timestamp).toLocaleString();
    li.innerHTML = `<div style="display: flex; justify-content: space-between;"><em>${reply.text}</em><small>${time}</small></div>`;
    replyList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadComments(currentPage);
});
