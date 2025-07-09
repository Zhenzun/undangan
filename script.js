// Ambil elemen penting
const invitation = document.getElementById("invitation");
const guestNameSpots = document.querySelectorAll("#guest-name, #guest-name-2");
const rsvpBtn = document.getElementById("rsvp-btn");
const bgMusic = document.getElementById("bg-music");

// Ambil nama dari URL (contoh: ?to=Rina%20Wijaya)
const params = new URLSearchParams(window.location.search);
const name = params.get("to");
const decodedName = name ? decodeURIComponent(name.replace(/\+/g, ' ')) : "Tamu Undangan";

// Tampilkan nama di undangan
guestNameSpots.forEach(el => el.textContent = decodedName);

// Ubah tombol RSVP otomatis
rsvpBtn.href = `https://wa.me/6281234567890?text=Halo%20saya%20${encodeURIComponent(decodedName)},%20insyaAllah%20akan%20hadir%20ke%20acara%20pernikahan%20Kerin%20dan%20Fika.`;

// Fungsi buka undangan
function openInvitation() {
  document.getElementById("cover").style.display = "none";
  invitation.style.display = "block";

  // Putar musik
  if (bgMusic) {
    bgMusic.play().catch(() => {
      // Autoplay bisa diblokir di beberapa browser, user bisa pencet manual
      console.log("User interaction required to play music.");
    });
  }

  // Opsional: munculkan efek daun jatuh
  for (let i = 0; i < 10; i++) {
    createFallingLeaf();
  }
}

// Efek daun jatuh terus menerus
function startLeafFallLoop() {
  setInterval(() => {
    createFallingLeaf();
  }, 600); // setiap 600ms bikin 1 daun baru
}

// Efek daun jatuh
function createFallingLeaf() {
  const leaf = document.createElement("div");
  leaf.classList.add("leaf");
  leaf.style.left = Math.random() * window.innerWidth + "px";
  leaf.style.animationDuration = 5 + Math.random() * 5 + "s";
  leaf.style.opacity = Math.random();
  document.body.appendChild(leaf);

  // Hapus daun setelah 10 detik
  setTimeout(() => leaf.remove(), 10000);
}

// Fungsi buka undangan
function openInvitation() {
  document.getElementById("cover").style.display = "none";
  invitation.style.display = "block";

  if (bgMusic) {
    bgMusic.play().catch(() => {
      console.log("User interaction required to play music.");
    });
  }

  // Mulai efek daun jatuh terus menerus
  startLeafFallLoop();
}
// Hitung mundur ke hari-H
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

  // Jika sudah lewat, stop & tampilkan pesan
  if (distance < 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerHTML = "<p>Acara telah selesai 💍</p>";
  }
}

// Update setiap detik
const countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // jalankan sekali saat awal
