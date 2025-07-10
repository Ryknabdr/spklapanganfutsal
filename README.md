
SPK Lapangan Futsal (Flask)

Aplikasi Sistem Pendukung Keputusan (SPK) untuk pemilihan lapangan futsal terbaik menggunakan metode **SAW (Simple Additive Weighting)**. Dibangun dengan Python dan Flask.

🧩 Fitur Utama

- Input data alternatif (lapangan futsal)
- Input kriteria dan bobot penilaian
- Perhitungan otomatis menggunakan metode SAW
- Hasil ranking alternatif terbaik
- Interface sederhana berbasis HTML + Bootstrap (atau Tailwind, jika digunakan)

🛠️ Teknologi

- Python 3.x
- Flask
- SQLite (atau MySQL/PostgreSQL jika digunakan)
- Jinja2 Template Engine
- HTML/CSS/JavaScript (opsional: Bootstrap/Tailwind)

🚀 Cara Menjalankan Aplikasi

1. Clone repositori:
   ```bash
   git clone https://github.com/Ryknabdr/spklapanganfutsal.git
   cd spklapanganfutsal
````

2. Aktifkan virtual environment (opsional tapi disarankan):

   ```bash
   python -m venv venv
   source venv/bin/activate      # Untuk Linux/Mac
   venv\Scripts\activate         # Untuk Windows
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Jalankan aplikasi Flask:

   ```bash
   flask run
   ```

5. Akses di browser:

   ```
   http://127.0.0.1:5000
   ```

📊 Metode SAW (Simple Additive Weighting)

Metode SAW digunakan untuk menghitung nilai akhir dari setiap alternatif berdasarkan bobot dan nilai setiap kriteria.

Langkah-langkah:

* Normalisasi nilai kriteria
* Kalikan dengan bobot
* Jumlahkan untuk mendapat total skor
* Urutkan untuk mendapatkan ranking terbaik

📂 Struktur Folder (Contoh)

```bash
spklapanganfutsal/
├── app.py
├── templates/
│   ├── index.html
│   ├── hasil.html
├── static/
├── database.db
├── requirements.txt
└── README.md
```

👨‍💻 Pengembang

Muh Abdul Raihan
  GitHub: [@Ryknabdr](https://github.com/Ryknabdr)

📄 Lisensi

Open source – Silakan digunakan dan dimodifikasi sesuai kebutuhan.


✅ Langkah Selanjutnya:
1. Buat file `README.md` di direktori utama proyek kamu
2. Paste isi di atas
3. Jalankan:

```bash
git add README.md
git commit -m "Menambahkan README untuk proyek Flask"
git push origin main
````


