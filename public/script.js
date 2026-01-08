// public/script.js

// --- 1. Variabel Global ---
let currentChapterIndex = 0;
let MANGA_DATA = null; // Akan diisi dengan object detail manga yang sedang dibaca
let mangaChapterList = []; // Array berisi list chapter (id, title, images)

// --- 2. DOM Elements ---
const els = {
    imageContainer: document.getElementById('image-container'),
    chapterNum: document.getElementById('current-chapter-num'),
    mangaTitle: document.querySelector('.manga-title'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnTop: document.getElementById('btn-top'),
    btnChapterList: document.getElementById('btn-chapter-list'),
    navRight: document.querySelector('.nav-right'), // Untuk menambahkan tombol home
    btnCloseModal: document.getElementById('btn-close-modal'),
    modal: document.getElementById('chapter-modal'),
    chapterList: document.getElementById('chapter-list'),
    loader: document.getElementById('loader'),
    toast: document.getElementById('toast')
};

// --- 3. Inisialisasi Utama ---
async function init() {
    try {
        // Tampilkan loader awal
        els.loader.innerHTML = '<p>Memuat database...</p>';
        els.loader.classList.remove('hidden');

        // 1. Ambil ID dari URL Query Parameter
        // Contoh: index.html?id=solo-leveling
        const urlParams = new URLSearchParams(window.location.search);
        const mangaId = urlParams.get('id');

        // 2. Fetch Data dari file JSON
        const response = await fetch('/manga_data.json');
        if (!response.ok) throw new Error("Gagal mengambil file data.");
        
        const allData = await response.json();

        // 3. Cari manga yang sesuai dengan ID
        // Jika ID kosong atau tidak ketemu, gunakan manga pertama sebagai default (fallback)
        MANGA_DATA = allData.find(manga => manga.id === mangaId) || allData[0];

        if (!MANGA_DATA) {
            throw new Error("Data manga kosong atau ID tidak valid.");
        }

        // 4. Tambahkan Tombol "Home" (Kembali ke Beranda)
        if (!document.getElementById('btn-home')) {
            const homeBtn = document.createElement('button');
            homeBtn.id = 'btn-home';
            homeBtn.className = 'btn-icon';
            homeBtn.title = 'Kembali ke Beranda';
            homeBtn.innerHTML = '🏠'; 
            homeBtn.style.marginRight = '10px';
            homeBtn.style.fontSize = '1.2rem';
            
            // Event click: Kembali ke beranda.html
            homeBtn.onclick = () => {
                window.location.href = '/beranda.html';
            };

            // Masukkan tombol di sebelah kiri tombol list chapter
            els.navRight.insertBefore(homeBtn, els.navRight.firstChild);
        }

        // 5. Proses Data: Ubah format Object Key ke Array
        // Data format user: { "chapter_1": [...], "chapter_2": [...] }
        // Kita ubah jadi: [ { id:1, title:..., images:... }, { id:2... } ]
        mangaChapterList = Object.keys(MANGA_DATA.image).map((key, index) => {
            return {
                id: index + 1,
                title: key.replace('chapter_', 'Chapter ').toUpperCase(),
                images: MANGA_DATA.image[key]
            };
        }).sort((a, b) => a.id - b.id); // Pastikan urut

        // 6. Setup UI
        els.mangaTitle.textContent = MANGA_DATA.title;
        renderChapterList();
        
        // 7. Load Chapter Pertama
        loadChapter(0);
        
        // 8. Event Listeners
        setupEventListeners();

    } catch (error) {
        console.error("Error Init:", error);
        els.imageContainer.innerHTML = '';
        els.loader.innerHTML = `
            <div style="text-align:center; color:#ff5555; padding: 20px;">
                <h3>Gagal Memuat Manga</h3>
                <p>${error.message}</p>
                <br>
                <a href="/beranda.html" style="color:var(--accent-color); text-decoration:underline; font-weight:bold;">
                    &larr; Kembali ke Beranda
                </a>
            </div>
        `;
        showToast("Error memuat data");
    }
}

function setupEventListeners() {
    els.btnPrev.addEventListener('click', () => navigateChapter(-1));
    els.btnNext.addEventListener('click', () => navigateChapter(1));
    els.btnTop.addEventListener('click', scrollToTop);
    els.btnChapterList.addEventListener('click', toggleModal);
    els.btnCloseModal.addEventListener('click', toggleModal);
    
    // Tutup modal jika klik area gelap (overlay)
    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) toggleModal();
    });
}

// --- 4. Fungsi Load Chapter (Inti Reader) ---
function loadChapter(index) {
    // Validasi index agar tidak out of bounds
    if (index < 0 || index >= mangaChapterList.length) return;

    // Update state
    currentChapterIndex = index;
    const chapter = mangaChapterList[index];

    // Update UI Header
    els.chapterNum.textContent = chapter.id;
    
    // Reset Scroll ke atas dengan smooth animation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Kosongkan konten lama & tampilkan loader
    els.imageContainer.innerHTML = '';
    els.loader.classList.remove('hidden');
    els.loader.innerHTML = '<div class="spinner"></div><p>Memuat halaman...</p>';

    // Render Gambar
    // Menggunakan setTimeout sedikit agar UI sempat "refresh" sebelum render banyak gambar
    setTimeout(() => {
        chapter.images.forEach((imgUrl, i) => {
            const img = document.createElement('img');
            
            // 1. Set atribut dasar
            img.loading = "lazy"; // Lazy loading native browser
            img.alt = `${chapter.title} - Hal ${i + 1}`;
            img.src = imgUrl;
            
            // 2. Styling animasi fade-in
            img.style.animationDelay = `${i * 0.05}s`;
            
            // 3. Error Handling: Jika gambar lokal (path /public/...) tidak ada
            img.onerror = function() {
                console.warn(`Gambar gagal dimuat: ${imgUrl}. Mengganti dengan placeholder.`);
                // Ganti dengan Picsum random agar tampilan tetap ada
                const randomSeed = Math.floor(Math.random() * 1000);
                this.src = `https://picsum.photos/seed/${randomSeed}/800/1200`;
            };
            
            els.imageContainer.appendChild(img);
        });

        // Sembunyikan loader setelah gambar selesai di-append
        els.loader.classList.add('hidden');
        
        // Update state tombol navigasi
        updateButtonStates();
        updateActiveChapterInList();
    }, 100);
}

// --- 5. Navigasi ---
function navigateChapter(direction) {
    const newIndex = currentChapterIndex + direction;
    if (newIndex >= 0 && newIndex < mangaChapterList.length) {
        loadChapter(newIndex);
        showToast(`Masuk ${mangaChapterList[newIndex].title}`);
    } else {
        // Feedback jika sudah di ujung
        if (direction < 0) showToast("Ini adalah chapter pertama");
        if (direction > 0) showToast("Ini adalah chapter terakhir");
    }
}

function updateButtonStates() {
    // Disable tombol prev jika di chapter 1
    els.btnPrev.disabled = currentChapterIndex === 0;
    // Disable tombol next jika di chapter terakhir
    els.btnNext.disabled = currentChapterIndex === mangaChapterList.length - 1;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 6. Modal & List Chapter ---
function renderChapterList() {
    els.chapterList.innerHTML = '';
    
    mangaChapterList.forEach((chapter, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        
        btn.textContent = chapter.title;
        btn.dataset.index = index;
        
        // Event Click pada list item
        btn.onclick = () => {
            loadChapter(index);
            toggleModal();
        };
        
        li.appendChild(btn);
        els.chapterList.appendChild(li);
    });
}

function updateActiveChapterInList() {
    const buttons = els.chapterList.querySelectorAll('button');
    buttons.forEach((btn, idx) => {
        if (idx === currentChapterIndex) {
            btn.classList.add('active');
            // Auto scroll ke item aktif di dalam modal
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            btn.classList.remove('active');
        }
    });
}

function toggleModal() {
    const isHidden = els.modal.classList.contains('hidden');
    if (isHidden) {
        els.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Stop scroll background
    } else {
        els.modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scroll
    }
}

// --- 7. Toast Notification ---
let toastTimeout;
function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
        els.toast.classList.add('hidden');
    }, 3000);
}

// Jalankan init saat DOM siap
document.addEventListener('DOMContentLoaded', init);
