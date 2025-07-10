document.addEventListener('DOMContentLoaded', function () {
    const btnHitung = document.getElementById('btn-hitung');

    const formBobot = document.getElementById('form-bobot');
    const formAlternatif = document.getElementById('form-alternatif');

    const totalBobotSpan = document.getElementById('total-bobot');
    const bobotWarning = document.getElementById('bobot-warning');

    // === Kriteria Section ===
    const formKriteria = document.getElementById('form-kriteria');
    const tabelKriteriaBody = document.querySelector('#tabel-kriteria tbody');
    const notifKriteria = document.getElementById('notif-kriteria');

    function showNotifKriteria(msg, success = true) {
        notifKriteria.innerHTML = `<div class="alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show" role="alert">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    function fetchKriteria() {
        fetch('/api/kriteria')
            .then(res => res.json())
            .then(data => {
                tabelKriteriaBody.innerHTML = '';
                data.forEach(k => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>
                            <span class="kriteria-nama" data-id="${k.id}">${k.nama}</span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning btn-edit me-1" data-id="${k.id}" data-nama="${k.nama}">Edit</button>
                            <button class="btn btn-sm btn-danger btn-hapus" data-id="${k.id}">Hapus</button>
                        </td>
                    `;
                    tabelKriteriaBody.appendChild(tr);
                });
            });
    }

    function updateTotalBobot() {
        const harga = parseFloat(document.getElementById('harga').value) || 0;
        const jarak = parseFloat(document.getElementById('jarak').value) || 0;
        const fasilitas = parseFloat(document.getElementById('fasilitas').value) || 0;
        const kenyamanan = parseFloat(document.getElementById('kenyamanan').value) || 0;
        const pencahayaan = parseFloat(document.getElementById('pencahayaan').value) || 0;

        const total = harga + jarak + fasilitas + kenyamanan + pencahayaan;
        totalBobotSpan.textContent = total.toFixed(2);

        if (total.toFixed(2) !== '1.00') {
            bobotWarning.style.display = 'block';
        } else {
            bobotWarning.style.display = 'none';
        }
    }



    // === Alternatif Section (aksi di hasil) ===
    function showNotifHasil(msg, success = true) {
        let notif = document.getElementById('notif-hasil');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'notif-hasil';
            // Tempel di atas hasil-card-list
            const hasilCardList = document.getElementById('hasil-card-list');
            if (hasilCardList) {
                hasilCardList.parentElement.prepend(notif);
            }
        }
        notif.innerHTML = `<div class="alert alert-${success ? 'success' : 'danger'} alert-dismissible fade show" role="alert">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
    }

    function renderHasilCards(data) {
        const hasilCardList = document.getElementById('hasil-card-list');
        if (!hasilCardList) return;
        hasilCardList.innerHTML = '';
        data.forEach(item => {
            // Ranking style
            let rankHtml = `<span class='badge bg-secondary fs-5'>#${item.peringkat}</span>`;
            let cardBorder = '';
            let trophy = '';
            if (item.peringkat === 1) {
                rankHtml = `<span class='badge bg-warning text-dark fs-5'>🏆 #1</span>`;
                cardBorder = 'border-warning';
                trophy = '<div class="fs-2">🏆</div>';
            } else if (item.peringkat === 2) {
                rankHtml = `<span class='badge bg-secondary fs-5'>🥈 #2</span>`;
                cardBorder = 'border-secondary';
                trophy = '<div class="fs-2">🥈</div>';
            } else if (item.peringkat === 3) {
                rankHtml = `<span class='badge bg-bronze fs-5' style='background:#cd7f32;color:#fff;'>🥉 #3</span>`;
                cardBorder = '';
                trophy = '<div class="fs-2">🥉</div>';
            }
            // Kriteria detail
            const kriteriaList = Object.entries(item.normalisasi).map(([k,v]) =>
                `<div class='d-flex justify-content-between'><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span><span class='fw-bold'>${v.toFixed(3)}</span></div>`
            ).join('');
            // Card
            const card = document.createElement('div');
            card.className = `col-12 col-md-6 col-lg-4`;
            card.innerHTML = `
                <div class="card shadow-sm mb-2 ${cardBorder}">
                    <div class="card-body text-center">
                        ${trophy}
                        <div class="mb-2">${rankHtml}</div>
                        <h5 class="card-title mb-1">${item.nama}</h5>
                        <div class="mb-2">${kriteriaList}</div>
                        <div class="mb-2 fw-bold text-primary">Total Skor: ${item.total_skor.toFixed(3)}</div>
                        <div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-sm btn-danger btn-hapus-alt" data-nama="${item.nama}">Hapus</button>
                        </div>
                    </div>
                </div>
            `;
            hasilCardList.appendChild(card);
        });
    }

    // Update event btnHitung
    if (btnHitung) {
        const bobotList = document.getElementById('bobot-list');
        const lapanganTerbaikDiv = document.getElementById('lapangan-terbaik');
        btnHitung.addEventListener('click', function () {
            fetch('/api/hitung')
                .then(response => response.json())
                .then(data => {
                    const hasilCardList = document.getElementById('hasil-card-list');
                    if (hasilCardList) {
                        hasilCardList.innerHTML = '';
                        if (bobotList) {
                            bobotList.innerHTML = '';
                        }
                        if (lapanganTerbaikDiv) {
                            lapanganTerbaikDiv.style.display = 'none';
                            lapanganTerbaikDiv.innerHTML = '';
                        }
                        // Display bobot kriteria summary
                        if (data.length > 0 && bobotList) {
                            const firstItem = data[0];
                            for (const [key, val] of Object.entries(firstItem.normalisasi)) {
                                const bobotSpan = document.createElement('div');
                                bobotSpan.style.textAlign = 'center';
                                bobotSpan.style.flex = '1';
                                bobotSpan.innerHTML = `<div>${key.charAt(0).toUpperCase() + key.slice(1)}</div><div style="color:#a855f7;">${val.toFixed(2)}</div>`;
                                bobotList.appendChild(bobotSpan);
                            }
                        }
                        // Render hasil as cards
                        renderHasilCards(data);
                        // Show best alternative
                        if (lapanganTerbaikDiv && data.length > 0) {
                            const best = data[0];
                            lapanganTerbaikDiv.style.display = 'block';
                            lapanganTerbaikDiv.innerHTML = `
                                🏆 Lapangan Terbaik 🏆<br/>
                                <strong>${best.nama}</strong><br/>
                                Skor Total: <strong>${best.total_skor.toFixed(3)}</strong>
                            `;
                        }
                    }
                })
                .catch(error => {
                    console.error('Error fetching SAW results:', error);
                });
        });
    }

    // Delegasi event untuk tombol Hapus alternatif di hasil card
    const hasilCardList = document.getElementById('hasil-card-list');
    if (hasilCardList) {
        hasilCardList.addEventListener('click', function(e) {
            const target = e.target;
            if (target.classList.contains('btn-hapus-alt')) {
                const nama = target.getAttribute('data-nama');
                console.log('Mencoba menghapus alternatif:', nama);
                if (confirm('Yakin ingin menghapus alternatif ini?')) {
                    const url = `/api/alternatif/${encodeURIComponent(nama)}`;
                    console.log('URL delete:', url);
                    fetch(url, { 
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(res => {
                        console.log('Response status:', res.status);
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(result => {
                        console.log('Delete result:', result);
                        showNotifHasil(result.message || 'Alternatif dihapus', true);
                        btnHitung.click(); // refresh hasil
                    })
                    .catch(error => {
                        console.error('Error deleting alternatif:', error);
                        showNotifHasil('Gagal menghapus alternatif: ' + error.message, false);
                    });
                }
            }
        });
    }

    if (formBobot) {
        formBobot.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = [
                { nama: 'harga', bobot: parseFloat(document.getElementById('harga').value) },
                { nama: 'jarak', bobot: parseFloat(document.getElementById('jarak').value) },
                { nama: 'fasilitas', bobot: parseFloat(document.getElementById('fasilitas').value) },
                { nama: 'kenyamanan', bobot: parseFloat(document.getElementById('kenyamanan').value) },
                { nama: 'pencahayaan', bobot: parseFloat(document.getElementById('pencahayaan').value) }
            ];
            fetch('/api/kriteria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message || 'Bobot kriteria berhasil diperbarui');
                formBobot.reset();
                updateTotalBobot();
            })
            .catch(error => {
                console.error('Error updating kriteria:', error);
                alert('Gagal memperbarui bobot kriteria');
            });
        });

        // Update total bobot on input change
        ['harga', 'jarak', 'fasilitas', 'kenyamanan', 'pencahayaan'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', updateTotalBobot);
            }
        });

        // Initialize total bobot on page load
        updateTotalBobot();
    }

    if (formAlternatif) {
        formAlternatif.addEventListener('submit', function (e) {
            e.preventDefault();
            const data = {
                nama: document.getElementById('nama').value,
                harga: parseFloat(document.getElementById('harga-alt').value),
                jarak: parseFloat(document.getElementById('jarak-alt').value),
                fasilitas: parseFloat(document.getElementById('fasilitas-alt').value),
                kenyamanan: parseFloat(document.getElementById('kenyamanan-alt').value),
                pencahayaan: parseFloat(document.getElementById('pencahayaan-alt').value)
            };
            fetch('/api/alternatif', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                alert(result.message || 'Alternatif berhasil ditambahkan');
                formAlternatif.reset();
            })
            .catch(error => {
                console.error('Error adding alternatif:', error);
                alert('Gagal menambahkan alternatif');
            });
        });
    }

    if (formKriteria) {
        fetchKriteria();
        formKriteria.addEventListener('submit', function(e) {
            e.preventDefault();
            const nama = document.getElementById('nama-kriteria').value.trim();
            if (!nama) return;
            fetch('/api/kriteria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([{ nama }])
            })
            .then(res => res.json())
            .then(result => {
                showNotifKriteria(result.message || 'Kriteria berhasil ditambahkan', true);
                formKriteria.reset();
                fetchKriteria();
            })
            .catch(() => showNotifKriteria('Gagal menambah kriteria', false));
        });

        // Delegasi event untuk tombol edit & hapus
        tabelKriteriaBody.addEventListener('click', function(e) {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (target.classList.contains('btn-hapus')) {
                if (confirm('Yakin ingin menghapus kriteria ini?')) {
                    fetch(`/api/kriteria/${id}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(result => {
                            showNotifKriteria(result.message || 'Kriteria dihapus', true);
                            fetchKriteria();
                        })
                        .catch(() => showNotifKriteria('Gagal menghapus kriteria', false));
                }
            } else if (target.classList.contains('btn-edit')) {
                const oldNama = target.getAttribute('data-nama');
                const newNama = prompt('Edit nama kriteria:', oldNama);
                if (newNama && newNama.trim() && newNama !== oldNama) {
                    fetch(`/api/kriteria/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nama: newNama.trim() })
                    })
                    .then(res => res.json())
                    .then(result => {
                        showNotifKriteria(result.message || 'Kriteria diupdate', true);
                        fetchKriteria();
                    })
                    .catch(() => showNotifKriteria('Gagal mengedit kriteria', false));
                }
            }
        });
    }
});
