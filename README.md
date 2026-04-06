# Glory Commission System

Sistem manajemen komisi dan operasional internal untuk **PT. Aneka Delapan Dekorasi**. Aplikasi ini dirancang untuk memantau kinerja sales, memvalidasi _invoice_, serta dan mengelola laporan pencairan komisi (_payout_) karyawan secara *real-time*.

## 🚀 Fitur Utama

- **Role-Based Access Control (RBAC):** Akses spesifik berdasarkan peran pengguna (Super Admin, Admin, User).
- **Manajemen Invoice:** Pengajuan invoice dengan pelacakan status konfirmasi secara langsung.
- **Review Queue (Validasi):** Pengecekan silang otomatis terhadap invoice untuk meminimalisasi kesalahan.
- **Laporan Komisi & Payout:** Dashboard komprehensif untuk pelacakan komisi yang belum dicairkan serta riwayat pencairan, mendukung transparansi finansial untuk tiap tim.
- **Pengelolaan Harga:** Manajerial daftar produk (_Product Prices_) khusus untuk tingkatan admin.
- **Glassmorphism UI:** Antarmuka responsif dan estetis, terinspirasi dari gaya desain Apple/Notion yang premium.

## 🛠 Tech Stack

**Front-end:**
- **Framework:** React 18 / Vite 
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Vanilla CSS (Glassmorphism), Lucide React Icons
- **State/Routing:** React Router v7

**Back-end:**
- **Runtime / Framework:** Node.js / Express.js
- **Database:** SQLite (Better-SQLite3)
- **Security & Uploads:** JWT Authentication, Bcrypt (Password Hashing), Multer (File Uploads)

## 📁 Struktur Folder

- `src/`: Berisi kode antarmuka (_Frontend_) berbasis React.
  - `app/components/`: Komponen antarmuka yang dapat digunakan kembali (termasuk *Sidebar* dan *Glassmorphism card*).
  - `app/pages/`: File rendering level halaman sesuai jalur di Router.
  - `app/context/`: Konteks global seperti *AuthContext* untuk sesi.
- `server/`: Berisi kode latar belakang (_Backend_ / REST API) termasuk model *database* dan *endpoint*.

## ⚙️ Persyaratan Sistem & Instalasi

Pastikan **Node.js** terinstal pada perangkat Anda.

1. **Clone repository ini:**
   ```bash
   git clone (https://github.com/apawardhana/commision-employe.git)
   cd Commision-Employee
   ```

2. **Instalasi dependencies:**
   ```bash
   npm install
   ```

3. **Inisialisasi Database:**
   Pastikan Anda sudah memiliki master struktur database (biasanya akan dibentuk otomatis oleh skrip di sisi server saat pertama kali jalan).

4. **Menjalankan Sistem Secara Lokal:**
   Gunakan skrip _concurrently_ agar backend dan frontend berjalan bersamaan.
   ```bash
   npm run dev:full
   ```
   *Frontend akan berjalan di port `3000` dan Backend/API akan berjalan di port `4000`.*

## 👥 Sistem Peran (Roles)

Setiap akun memiliki hierarki sebagai berikut:
1. **Super Admin**: Memiliki akses tertinggi, meliputi pengaturan sistem, manipulasi data pengguna, revisi invoice, penyetujuan harga produk, serta eksekusi absensi/keuangan tingkat lanjutan.
2. **Admin**: Mengelola validasi harian _Review Queue_, mengurus daftar *invoice*, dan mengatur _Pricing_. 
3. **User**: Anggota tim (Sales / Karyawan). Hanya dapat melihat statistik kinerjanya sendiri, melihat daftar *invoice*-nya sendiri, dan merangkum jumlah riwayat komisinya secara isolatif (*Isolasi Data*).
