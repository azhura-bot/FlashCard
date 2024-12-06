/* Array berisi objek yang mendefinisikan pasangan gambar untuk kartu permainan */
const cards = [
    { question: "images/1.png", answer: "images/2.png" }, // pasangan gambar untuk kartu pertama
    { question: "images/3.png", answer: "images/4.png" }, // pasangan gambar untuk kartu kedua
    { question: "images/5.png", answer: "images/6.png" }, // pasangan gambar untuk kartu ketiga
    { question: "images/7.png", answer: "images/8.png" }  // pasangan gambar untuk kartu keempat
];

/* Variabel untuk melacak status permainan dan interval timer */
let isGameStarted = false;
let timerInterval;

/* Mendapatkan elemen DOM yang akan digunakan untuk menampilkan kartu, tombol mulai, dan timer */
const cardContainer = document.getElementById("card-container"); // Container untuk kartu permainan
const startBtn = document.getElementById("start-btn"); // Tombol untuk memulai/reset permainan
const timerElement = document.getElementById("timer"); // Elemen untuk menampilkan waktu tersisa

// Setup untuk audio permainan
let bellSound = new Audio("sound/bell.mp3"); // Suara bel yang diputar saat waktu habis
let backgroundMusic = new Audio("sound/background.mp3"); // Musik latar belakang
backgroundMusic.loop = true; // Musik latar dimainkan terus-menerus
backgroundMusic.volume = 0.5; // Pengaturan volume musik latar
backgroundMusic.play(); // Memulai musik latar

/* Fungsi untuk mengacak urutan kartu */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) { // Mulai dari akhir array
        const j = Math.floor(Math.random() * (i + 1)); // Pilih indeks acak
        [array[i], array[j]] = [array[j], array[i]]; // Tukar elemen
    }
    return array; // Mengembalikan array yang sudah diacak
}

/* Fungsi untuk membuat tampilan awal sebelum permainan dimulai */
function createInitialSetup() {
    cardContainer.innerHTML = ""; // Bersihkan semua kartu sebelumnya
    const staticCard = document.createElement("div"); // Membuat elemen kartu statis
    staticCard.classList.add("card"); // Menambahkan kelas 'card' pada elemen
    staticCard.innerHTML = `
        <div class="card-inner">
            <div class="card-front">Start</div> <!-- Menampilkan tulisan "Start" pada sisi depan kartu -->
            <div class="card-back">Static Card</div> <!-- Menampilkan tulisan "Static Card" pada sisi belakang kartu -->
        </div>
    `;
    cardContainer.appendChild(staticCard); // Menambahkan kartu statis ke dalam container
}

/* Fungsi untuk membuat kartu permainan berdasarkan urutan yang diacak */
function createGameCards() {
    const shuffledCards = shuffle([...cards]); // Mengacak kartu dan menduplikat array cards
    shuffledCards.slice(0, 4).forEach(({ question, answer }) => { // Ambil 4 kartu pertama
        const card = document.createElement("div"); // Membuat elemen kartu baru
        card.classList.add("card", "hidden"); // Menambahkan kelas 'card' dan 'hidden' pada kartu
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${question}" alt="Question Image" /> <!-- Menampilkan gambar pertanyaan -->
                </div>
                <div class="card-back">
                    <img src="${answer}" alt="Answer Image" /> <!-- Menampilkan gambar jawaban -->
                </div>
            </div>
        `;
        card.addEventListener("click", () => { // Menambahkan event listener untuk flip kartu saat diklik
            if (!isGameStarted || startBtn.disabled) return; // Jika game belum dimulai atau tombol start disabled, tidak ada aksi
            card.classList.toggle("flipped"); // Menambah/menghapus kelas 'flipped' untuk membalikkan kartu
        });
        cardContainer.appendChild(card); // Menambahkan kartu ke dalam container
    });
}

/* Fungsi untuk memformat waktu menjadi format MM:SS */
function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0"); // Menghitung menit dan memastikan 2 digit
    const secs = String(seconds % 60).padStart(2, "0"); // Menghitung detik dan memastikan 2 digit
    return `Time Remaining: 00:${mins}:${secs}`; // Mengembalikan format waktu
}

/* Fungsi untuk memulai permainan */
function startGame() {
    isGameStarted = true; // Menandakan bahwa permainan telah dimulai
    startBtn.disabled = true; // Menonaktifkan tombol start
    createInitialSetup(); // Membuat setup awal permainan
    createGameCards(); // Membuat kartu permainan

    const allCards = document.querySelectorAll(".card"); // Mengambil semua elemen kartu
    const animatedCards = Array.from(allCards).slice(1); // Mengambil kartu setelah kartu statis

    let visibleCount = 0; // Variabel untuk menghitung kartu yang terlihat
    const isMobile = window.innerWidth <= 768; // Menentukan apakah perangkat adalah mobile

    const cardInterval = setInterval(() => { // Interval untuk menampilkan kartu satu per satu
        if (visibleCount >= 4) { // Jika sudah ada 4 kartu yang terlihat, berhenti
            clearInterval(cardInterval);
            startTimer(); // Memulai timer
            return;
        }
        const currentCard = animatedCards[visibleCount]; // Mengambil kartu berikutnya untuk ditampilkan
        currentCard.classList.remove("hidden"); // Menghapus kelas 'hidden' untuk menampilkan kartu

        // Jika perangkat mobile, set transform ke translateX(0), jika tidak, pertahankan transformasi yang ada
        if (isMobile) {
            currentCard.style.transform = `translateX(0)`; // Untuk perangkat mobile
        } else {
            currentCard.style.transform = `translateX(${visibleCount * 120 + 30}px)`; // Untuk perangkat selain mobile
        }

        visibleCount++; // Meningkatkan jumlah kartu yang terlihat
    }, 500); // Menampilkan kartu setiap 500ms
}

/* Fungsi untuk memulai timer */
function startTimer() {
    let timeRemaining = 10; // Menentukan waktu permainan
    timerElement.textContent = formatTime(timeRemaining); // Menampilkan waktu awal

    timerInterval = setInterval(() => { // Interval untuk mengurangi waktu setiap detik
        timeRemaining--; // Mengurangi waktu setiap detik
        timerElement.textContent = formatTime(timeRemaining); // Memperbarui tampilan waktu

        if (timeRemaining <= 0) { // Jika waktu habis
            clearInterval(timerInterval); // Menghentikan timer
            bellSound.play(); // Memutar suara bel
            enableReset(); // Mengaktifkan tombol reset
        }
    }, 1000); // Timer berfungsi setiap 1000ms (1 detik)
}

/* Fungsi untuk mengaktifkan tombol reset setelah waktu habis */
function enableReset() {
    startBtn.disabled = false; // Mengaktifkan tombol start
    startBtn.textContent = "Reset"; // Mengubah teks tombol menjadi "Reset"
}

/* Fungsi untuk mereset permainan */
function resetGame() {
    const allCards = document.querySelectorAll(".card"); // Mengambil semua elemen kartu
    const animatedCards = Array.from(allCards).slice(1); // Mengambil kartu setelah kartu statis

    let hiddenCount = 0; // Variabel untuk menghitung kartu yang disembunyikan
    const resetInterval = setInterval(() => { // Interval untuk menyembunyikan kartu satu per satu
        if (hiddenCount >= 4) { // Jika semua kartu sudah disembunyikan
            clearInterval(resetInterval);
            createInitialSetup(); // Membuat setup awal lagi
            isGameStarted = false; // Menandakan bahwa permainan belum dimulai

            // Enable Start button after reset animation
            startBtn.disabled = false; // Mengaktifkan tombol start
            startBtn.textContent = "Start"; // Mengubah teks tombol menjadi "Start"
            return;
        }
        const currentCard = animatedCards[hiddenCount]; // Mengambil kartu berikutnya untuk disembunyikan
        currentCard.style.transform = "translateX(0px)"; // Menyetel transformasi kartu
        currentCard.classList.add("hidden"); // Menambahkan kelas 'hidden' untuk menyembunyikan kartu
        hiddenCount++; // Meningkatkan jumlah kartu yang disembunyikan
    }, 500); // Menyembunyikan kartu setiap 500ms
}

/* Menambahkan event listener pada tombol start/reset untuk memulai atau mereset permainan */
startBtn.addEventListener("click", () => {
    if (startBtn.textContent === "Reset") { // Jika tombol berisi "Reset"
        resetGame(); // Mereset permainan
    } else {
        startGame(); // Memulai permainan
    }
});
