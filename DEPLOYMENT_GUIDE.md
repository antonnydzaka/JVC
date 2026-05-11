# Panduan Deployment Google Cloud Run (#JuaraVibeCoding)

Aplikasi Anda kini sudah siap untuk dideploy! Semua konfigurasi (Dockerfile, Backend, Frontend) sudah diatur sedemikian rupa agar bisa di-_deploy_ sekaligus ke Google Cloud Run dengan 1 kali perintah.

Ikuti instruksi berikut secara berurutan:

### Tahap 1: Persiapan Aplikasi & Google Cloud CLI
1. Pastikan Anda sudah menginstal **Google Cloud CLI** di komputer Windows Anda. Jika belum, silakan unduh dan instal dari [halaman resmi Google Cloud](https://cloud.google.com/sdk/docs/install).
2. Buka terminal (Command Prompt atau PowerShell) baru di dalam folder proyek Anda (`c:\Users\Antonny Dzaka F\OneDrive\Documents\ppppp\vibeCoding`).
3. Login ke akun Google Cloud Anda dengan mengetik:
   ```powershell
   gcloud auth login
   ```
4. Arahkan *environment* ke ID Project Google Cloud Anda:
   ```powershell
   gcloud config set project NAMA_PROJECT_ID_ANDA
   ```
   *(Tips: Anda bisa menemukan ID Project Anda di bagian atas dashboard Google Cloud Console).*

### Tahap 2: Proses Deploy!
Masih di terminal yang sama (berada di *root folder* proyek Anda), jalankan perintah magis ini:

```powershell
gcloud run deploy vibe-coding-app --source . --region asia-southeast2 --allow-unauthenticated
```

**Keterangan:**
- `--source .` berarti Google Cloud akan membangun aplikasi Anda menggunakan file `Dockerfile` yang telah kita siapkan.
- `--region asia-southeast2` mengarahkan server ke region Jakarta agar aplikasi lebih cepat diakses dari Indonesia.

Ketika ditanya di terminal:
- Jika muncul pertanyaan "Enable API...?", ketik `y` (Yes) lalu Enter.
- Tunggu beberapa menit untuk Google Cloud membangun (*build*) aplikasi Anda.

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
