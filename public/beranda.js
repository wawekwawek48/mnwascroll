// public/beranda.js

let allMangaData = [];

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('manga-grid');
    const countSpan = document.getElementById('count');
    const searchInput = document.getElementById('search-input');
    const catButtons = document.querySelectorAll('.cat-btn');

    try {
        // 1. Fetch Data
        const response = await fetch('/manga_data.json');
        allMangaData = await response.json();

        // 2. Render Awal
        renderManga(allMangaData);

        // 3. Event Listener: Search
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            filterData(keyword, getActiveCategory());
        });

        // 4. Event Listener: Category Filter
        catButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // UI Update active class
                catButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const type = btn.getAttribute('data-type');
                const keyword = searchInput.value.toLowerCase();
                filterData(keyword, type);
            });
        });

    } catch (error) {
        console.error("Gagal memuat data:", error);
        grid.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat data manga.</p>`;
    }

    // Fungsi Render Kartu
    function renderManga(data) {
        grid.innerHTML = '';
        countSpan.textContent = data.length;

        if (data.length === 0) {
            grid.innerHTML = `<p style="color:#aaa; text-align:center; width:100%;">Tidak ada manga ditemukan.</p>`;
            return;
        }

        data.forEach(manga => {
            // Tentukan gambar fallback jika banner kosong
            const imgSrc = manga.banner || `https://picsum.photos/seed/${manga.id}/300/450`;
            
            // Badge warna status
            const statusColor = manga.status === 'ongoing' ? '#4caf50' : '#9e9e9e';

            const card = document.createElement('div');
            card.className = 'manga-card';
            card.onclick = () => openManga(manga.id); // Klik card -> buka reader

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${imgSrc}" alt="${manga.title}" loading="lazy" class="card-img">
                    <div class="card-badge" style="background-color: ${statusColor}">
                        ${manga.status}
                    </div>
                    <div class="card-rating">
                        ⭐ ${manga.rating}
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${manga.title}</h3>
                    <p class="card-type">${manga.type.toUpperCase()}</p>
                    <div class="card-genres">
                        ${manga.genres.slice(0, 2).map(g => `<span>${g}</span>`).join('')}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // Fungsi Filter
    function filterData(keyword, type) {
        const filtered = allMangaData.filter(item => {
            // Filter Judul
            const matchTitle = item.title.toLowerCase().includes(keyword);
            // Filter Tipe
            const matchType = type === 'all' || item.type === type;
            
            return matchTitle && matchType;
        });
        renderManga(filtered);
    }

    function getActiveCategory() {
        const activeBtn = document.querySelector('.cat-btn.active');
        return activeBtn ? activeBtn.getAttribute('data-type') : 'all';
    }

    // Redirect ke halaman reader dengan ID
    function openManga(id) {
        window.location.href = `index.html?id=${id}`;
    }
});
