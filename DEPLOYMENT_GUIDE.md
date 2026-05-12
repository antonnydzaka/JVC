# Panduan Deployment Google Cloud Run (#JuaraVibeCoding)

Aplikasi Anda kini sudah siap untuk dideploy! Semua konfigurasi (Dockerfile, Backend, Frontend) sudah diatur sedemikian rupa agar bisa di-_deploy_ sekaligus ke Google Cloud Run dengan 1 kali perintah.

Ikuti instruksi berikut secara berurutan:

### Tahap 1: Upload File ke Cloud Shell (Cara Paling Mudah)
Karena terminal lokal Anda bermasalah, kita akan menggunakan **Google Cloud Shell** (Terminal online bawaan Google Cloud). Saya sudah membuatkan file **`vibeCoding-deploy.zip`** di folder proyek Anda yang berisi semua file siap deploy.

1. Buka browser dan pergi ke **[Google Cloud Console](https://console.cloud.google.com/)**. Pastikan ID Project Anda sudah benar di bagian atas.
2. Di pojok kanan atas, klik ikon **"Activate Cloud Shell"** (Ikon terminal `>_`). Jendela terminal akan terbuka di bagian bawah layar browser.
3. Di menu terminal Cloud Shell tersebut, klik ikon tiga titik vertikal (More) lalu pilih **Upload**.
4. Pilih file **`vibeCoding-deploy.zip`** yang ada di komputer Anda (`c:\Users\Antonny Dzaka F\OneDrive\Documents\ppppp\vibeCoding\vibeCoding-deploy.zip`) lalu klik **Upload**.

### Tahap 2: Proses Deploy di Cloud Shell!
Setelah proses upload selesai, jalankan tiga perintah ini satu per satu di dalam terminal Cloud Shell tersebut:

**Ekstrak filenya:**
```bash
unzip vibeCoding-deploy.zip -d deploy-folder
```

**Masuk ke foldernya:**
```bash
cd deploy-folder
```

**Deploy ke Cloud Run!**
```bash
gcloud run deploy vibe-coding-app --source . --region asia-southeast2 --allow-unauthenticated
```

Ketika ditanya di terminal Cloud Shell:
- Jika muncul "Enable API...?", ketik `y` (Yes) lalu Enter.
- Tunggu beberapa menit untuk Google Cloud membangun (*build*) aplikasi Anda secara otomatis di Cloud.

### Tahap 3: Konfigurasi API Key (PENTING!)
Setelah aplikasi berhasil ter-deploy, akan muncul **URL Publik** aplikasi Anda. Namun, aplikasi belum bisa digunakan karena membutuhkan API Key Gemini.

Mari masukkan API Key ke server Cloud Run:
1. Buka halaman [Google Cloud Console - Cloud Run](https://console.cloud.google.com/run).
2. Klik layanan yang baru saja Anda deploy (`vibe-coding-app`).
3. Klik tombol **"EDIT & DEPLOY NEW REVISION"** di menu bagian atas.
4. Scroll ke bawah, temukan dan klik tab **"Variables & Secrets"**.
5. Di bagian **Environment Variables**, klik tombol **"ADD VARIABLE"**.
    - Kolom **Name**: isi dengan `GEMINI_API_KEY`
    - Kolom **Value**: isi dengan API Key Anda (misal `AIzaSy...`)
6. Klik tombol biru **"DEPLOY"** di bagian paling bawah.
7. Tunggu beberapa saat, dan buka kembali URL aplikasi Anda. Semuanya seharusnya sudah berjalan lancar!

---

## Tahap Akhir: Submit Karya Anda!
Sesuai persyaratan kompetisi **#JuaraVibeCoding**:
1. Buka URL hasil deployment Anda di browser.
2. Gunakan *screen recorder* untuk merekam demo penggunaan aplikasi selama **2 - 3 menit**.
3. Buat postingan di LinkedIn dengan melampirkan video tersebut. Gunakan hashtag **#JuaraVibeCoding** dan jangan lupa tag akun **@GoogleDevelopers**.
4. Isi form submission resmi dari program JuaraVibeCoding menggunakan URL Aplikasi Cloud Run dan link postingan LinkedIn Anda sebelum tanggal 31 Mei 2026.

Semoga berhasil! Beritahu saya jika Anda menemui kendala saat proses instalasi atau *deploy* di terminal.
