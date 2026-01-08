// public/script.js

// --- 1. Variabel Global ---
let currentChapterIndex = 0;
let MANGA_DATA = null; // Object detail manga yang sedang dibaca
let mangaChapterList = []; // Array list chapter

// --- 2. DOM Elements ---
const els = {
    imageContainer: document.getElementById('image-container'),
    chapterNum: document.getElementById('current-chapter-num'),
    mangaTitle: document.querySelector('.manga-title'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnTop: document.getElementById('btn-top'),
    btnChapterList: document.getElementById('btn-chapter-list'),
    navRight: document.querySelector('.nav-right'), // Area navbar kanan
    btnCloseModal: document.getElementById('btn-close-modal'),
    modal: document.getElementById('chapter-modal'),
    chapterList: document.getElementById('chapter-list'),
    loader: document.getElementById('loader'),
    toast: document.getElementById('toast')
};

// --- 3. Inisialisasi Utama ---
async function init() {
    try {
        els.loader.innerHTML = '<p>Memuat database...</p>';
        els.loader.classList.remove('hidden');

        // 1. Ambil ID dari URL Query Parameter
        // Contoh: reader.html?id=shimotsuki-san-wa-mob-ga-suki
        const urlParams = new URLSearchParams(window.location.search);
        const mangaId = urlParams.get('id');

        // 2. Fetch Data dari JSON
        const response = await fetch('/manga_data.json');
        if (!response.ok) throw new Error("Gagal mengambil file data.");
        
        const allData = await response.json();

        // 3. Cari manga yang sesuai dengan ID
        // Jika ID kosong/kosong, pakai manga pertama sebagai fallback
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
            
            // Klik -> Balik ke beranda.html (bukan index.js)
            homeBtn.onclick = () => {
                window.location.href = '/beranda.html';
            };

            // Masukkan tombom di sebelah kiri tombol list chapter
            els.navRight.insertBefore(homeBtn, els.navRight.firstChild);
        }

        // 5. Proses Data: Ubah format Object Key ke Array
        // Dari: { "chapter_1": [...], "chapter_2": [...] }
        // Ke: [ { id:1, title:..., images:... }, ... ]
        mangaChapterList = Object.keys(MANGA_DATA.image).map((key, index) => {
            return {
                id: index + 1,
                title: key.replace('chapter_', 'Chapter ').toUpperCase(),
                images: MANGA_DATA.image[key]
            };
        }).sort((a, b) => a.id - b.id);

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
    els.modal.addEventListener('click', (e) => {
        if (e.target === els.modal) toggleModal();
    });
}

// --- 4. Fungsi Load Chapter ---
function loadChapter(index) {
    if (index < 0 || index >= mangaChapterList.length) return;

    currentChapterIndex = index;
    const chapter = mangaChapterList[index];

    els.chapterNum.textContent = chapter.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    els.imageContainer.innerHTML = '';
    els.loader.classList.remove('hidden');
    els.loader.innerHTML = '<div class="spinner"></div><p>Memuat halaman...</p>';

    setTimeout(() => {
        chapter.images.forEach((imgUrl, i) => {
            const img = document.createElement('img');
            img.loading = "lazy";
            img.alt = `${chapter.title} - Hal ${i + 1}`;
            img.src = imgUrl;
            img.style.animationDelay = `${i * 0.05}s`;
            
            // Error Handling untuk Gambar Rusak/404
            img.onerror = function() {
                console.warn(`Gambar error: ${imgUrl}`);
                const randomSeed = Math.floor(Math.random() * 1000);
                this.src = `https://picsum.photos/seed/${randomSeed}/800/1200`;
            };
            
            els.imageContainer.appendChild(img);
        });

        els.loader.classList.add('hidden');
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

// --- 6. Modal & List Chapter ---
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
        document.body.style.overflow = 'hidden';
    } else {
        els.modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
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

document.addEventListener('DOMContentLoaded', init);
