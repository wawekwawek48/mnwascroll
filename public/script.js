// public/script.js

// 1. Variabel Global
let currentChapterIndex = 0;
let MANGA_DATA = null; // Akan diisi oleh hasil fetch
let mangaChapterList = []; // List chapter yang sudah diproses

// 2. DOM Elements
const els = {
    imageContainer: document.getElementById('image-container'),
    chapterNum: document.getElementById('current-chapter-num'),
    mangaTitle: document.querySelector('.manga-title'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnTop: document.getElementById('btn-top'),
    btnChapterList: document.getElementById('btn-chapter-list'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    modal: document.getElementById('chapter-modal'),
    chapterList: document.getElementById('chapter-list'),
    loader: document.getElementById('loader'),
    toast: document.getElementById('toast'),
    descContainer: document.querySelector('.manga-desc') // Elemen baru untuk deskripsi (optional)
};

// 3. Inisialisasi: Fetch Data & Setup
async function init() {
    try {
        // Tampilkan loader awal
        els.loader.innerHTML = '<p>Memuat data manga...</p>';
        els.loader.classList.remove('hidden');

        // Fetch data dari file JSON
        const response = await fetch('/manga_data.json');
        const rawData = await response.json();

        if (!rawData || rawData.length === 0) {
            throw new Error("Data manga tidak ditemukan.");
        }

        // Ambil manga pertama (untuk demo ini kita ambil index 0)
        MANGA_DATA = rawData[0];

        // Proses data: Ubah format object keys 'chapter_1' ke Array
        // Format JSON User: { image: { "chapter_1": [...], "chapter_2": [...] } }
        mangaChapterList = Object.keys(MANGA_DATA.image).map((key, index) => {
            return {
                id: index + 1,
                title: key.replace('chapter_', 'Chapter ').toUpperCase(),
                images: MANGA_DATA.image[key]
            };
        }).sort((a, b) => a.id - b.id); // Urutkan berdasarkan ID

        // Setup UI
        els.mangaTitle.textContent = MANGA_DATA.title;
        renderChapterList();
        
        // Load chapter pertama
        loadChapter(0);
        
        // Event Listeners
        els.btnPrev.addEventListener('click', () => navigateChapter(-1));
        els.btnNext.addEventListener('click', () => navigateChapter(1));
        els.btnTop.addEventListener('click', scrollToTop);
        els.btnChapterList.addEventListener('click', toggleModal);
        els.btnCloseModal.addEventListener('click', toggleModal);
        els.modal.addEventListener('click', (e) => {
            if (e.target === els.modal) toggleModal();
        });

    } catch (error) {
        console.error(error);
        els.loader.innerHTML = `<p style="color:red">Gagal memuat data: ${error.message}</p>`;
        showToast("Error memuat data manga");
    }
}

// 4. Fungsi Utama: Load Chapter
function loadChapter(index) {
    // Validasi index
    if (index < 0 || index >= mangaChapterList.length) return;

    // Update state
    currentChapterIndex = index;
    const chapter = mangaChapterList[index];

    // Update UI Header
    els.chapterNum.textContent = chapter.id;
    
    // Reset Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Kosongkan konten lama & tampilkan loader
    els.imageContainer.innerHTML = '';
    els.loader.classList.remove('hidden');
    els.loader.innerHTML = '<div class="spinner"></div><p>Memuat halaman...</p>';

    // Render Gambar
    setTimeout(() => {
        chapter.images.forEach((imgUrl, i) => {
            const img = document.createElement('img');
            img.loading = "lazy"; 
            img.alt = `${chapter.title} - Page ${i + 1}`;
            img.src = imgUrl;
            
            // Styling gambar agar muncul bertahap
            img.style.animationDelay = `${i * 0.05}s`;
            
            // Error handling jika gambar lokal tidak ada (404)
            img.onerror = function() {
                // Jika gambar gagal dimuat (path lokal salah), ganti dengan placeholder
                this.src = `https://picsum.photos/seed/err-${i}/800/1200`; 
            };
            
            els.imageContainer.appendChild(img);
        });

        els.loader.classList.add('hidden');
        updateButtonStates();
        updateActiveChapterInList();
    }, 100);
}

// 5. Navigasi Chapter
function navigateChapter(direction) {
    const newIndex = currentChapterIndex + direction;
    if (newIndex >= 0 && newIndex < mangaChapterList.length) {
        loadChapter(newIndex);
        showToast(`Masuk ${mangaChapterList[newIndex].title}`);
    } else {
        if (direction < 0) showToast("Ini adalah chapter pertama");
        if (direction > 0) showToast("Ini adalah chapter terakhir");
    }
}

function updateButtonStates() {
    els.btnPrev.disabled = currentChapterIndex === 0;
    els.btnNext.disabled = currentChapterIndex === mangaChapterList.length - 1;
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 6. Modal & Chapter List Logic
function renderChapterList() {
    els.chapterList.innerHTML = '';
    mangaChapterList.forEach((chapter, index) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.textContent = chapter.title;
        btn.dataset.index = index;
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
        } else {
            btn.classList.remove('active');
        }
    });
}

function toggleModal() {
    const isHidden = els.modal.classList.contains('hidden');
    if (isHidden) {
        els.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        els.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 7. Toast Notification System
let toastTimeout;
function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
        els.toast.classList.add('hidden');
    }, 3000);
}

// Jalankan init saat halaman dimuat
document.addEventListener('DOMContentLoaded', init);
