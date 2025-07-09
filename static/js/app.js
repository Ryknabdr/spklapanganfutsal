document.addEventListener('DOMContentLoaded', function () {
    const btnReset = document.getElementById('btn-reset');
    const hasilTableBody = document.querySelector('#hasil-table tbody');
    const btnHitung = document.getElementById('btn-hitung');

    const formBobot = document.getElementById('form-bobot');
    const formAlternatif = document.getElementById('form-alternatif');

    const totalBobotSpan = document.getElementById('total-bobot');
    const bobotWarning = document.getElementById('bobot-warning');

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

    if (btnReset) {
        btnReset.addEventListener('click', function () {
            // Clear the table body content
            if (hasilTableBody) {
                hasilTableBody.innerHTML = '';
            }
        });
    }

    if (btnHitung) {
        const bobotList = document.getElementById('bobot-list');
        const lapanganTerbaikDiv = document.getElementById('lapangan-terbaik');

        btnHitung.addEventListener('click', function () {
            fetch('/api/hitung')
                .then(response => response.json())
                .then(data => {
                    if (hasilTableBody) {
                        hasilTableBody.innerHTML = '';
                        if (bobotList) {
                            bobotList.innerHTML = '';
                        }
                        if (lapanganTerbaikDiv) {
                            lapanganTerbaikDiv.style.display = 'none';
                            lapanganTerbaikDiv.innerHTML = '';
                        }

                        // Display bobot kriteria summary (assuming all items have same normalisasi keys)
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

                        // Populate results table with detailed columns
                        data.forEach(item => {
                            const tr = document.createElement('tr');

                            // Style ranking with icons/colors
                            let rankHtml = item.peringkat;
                            if (item.peringkat === 1) {
                                rankHtml = '<span style="background:#facc15; border-radius:50%; padding:5px 10px; color:#000;">🏆 #1</span>';
                            } else if (item.peringkat === 2) {
                                rankHtml = '<span style="background:#c0c0c0; border-radius:50%; padding:5px 10px; color:#000;">🥈 #2</span>';
                            } else if (item.peringkat === 3) {
                                rankHtml = '<span style="background:#cd7f32; border-radius:50%; padding:5px 10px; color:#000;">🥉 #3</span>';
                            }

                            tr.innerHTML = `
                                <td style="text-align:center;">${rankHtml}</td>
                                <td>${item.nama}</td>
                                <td>${item.normalisasi.harga.toFixed(3)}</td>
                                <td>${item.normalisasi.jarak.toFixed(3)}</td>
                                <td>${item.normalisasi.fasilitas.toFixed(3)}</td>
                                <td>${item.normalisasi.kenyamanan.toFixed(3)}</td>
                                <td>${item.normalisasi.pencahayaan.toFixed(3)}</td>
                                <td style="font-weight:bold; color:#a855f7;">${item.total_skor.toFixed(3)}</td>
                            `;
                            hasilTableBody.appendChild(tr);
                        });

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
});
