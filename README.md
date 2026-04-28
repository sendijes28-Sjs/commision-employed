# Glory Commission System

**Glory Commission System** adalah sistem manajemen komisi dan operasional internal yang dikembangkan untuk **PT. Aneka Delapan Dekorasi**.
Aplikasi ini membantu perusahaan dalam mengelola proses invoice, validasi transaksi, serta perhitungan dan pencairan komisi karyawan secara terstruktur dan real-time.

Dirancang untuk mendukung kebutuhan operasional harian, sistem ini mempermudah monitoring performa sales, mempercepat proses validasi, dan meningkatkan transparansi data komisi pada setiap tim.

---

## Fitur Utama

### Role-Based Access Control (RBAC)

Sistem akses berdasarkan peran pengguna untuk memastikan setiap user hanya dapat mengakses fitur sesuai kewenangannya:

- **Super Admin**
- **Admin**
- **User**

### Manajemen Invoice

Pengguna dapat mengajukan dan memantau invoice dengan status yang diperbarui secara real-time, sehingga proses pelacakan transaksi menjadi lebih mudah dan transparan.

### Review Queue

Menyediakan alur validasi invoice untuk membantu proses pengecekan data sebelum transaksi diproses lebih lanjut.

### Laporan Komisi & Payout

Menampilkan data komisi yang belum dicairkan, riwayat payout, serta ringkasan komisi untuk membantu proses monitoring keuangan secara lebih akurat.

### Pengelolaan Harga Produk

Admin dapat mengelola data harga produk yang digunakan sebagai dasar perhitungan komisi.

### Modern Responsive Interface

Antarmuka dirancang responsif dengan pendekatan visual modern menggunakan komponen yang konsisten, ringan, dan nyaman digunakan pada berbagai perangkat.

---

## Tech Stack

### Frontend

- **React 18** + **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React**
- **React Router**

### Backend

- **Node.js**
- **Express.js**
- **SQLite** (_better-sqlite3_)
- **JWT Authentication**
- **Bcrypt**
- **Multer**

---

## Struktur Project

### Frontend

Folder `src/` berisi seluruh source code antarmuka berbasis React:

- `app/components/` → komponen reusable seperti sidebar, cards, dan layout
- `app/pages/` → halaman utama aplikasi
- `app/context/` → global state seperti autentikasi user

### Backend

Folder `server/` berisi REST API, database handling, serta proses autentikasi dan pengolahan data.

---

## Instalasi & Menjalankan Project

Pastikan **Node.js** sudah terinstal.

### 1. Clone Repository

```bash
git clone https://github.com/apawardhana/commision-employe.git
cd Commision-Employee
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Aplikasi

```bash
npm run dev:full
```

Frontend berjalan di:

```bash
http://localhost:3000
```

Backend berjalan di:

```bash
http://localhost:4000
```

---

## Role Pengguna

### Super Admin

Memiliki akses penuh terhadap seluruh sistem, termasuk pengelolaan user, validasi data, pengaturan harga, serta kontrol operasional tingkat lanjut.

### Admin

Bertanggung jawab terhadap validasi invoice, pengelolaan daftar transaksi, serta pengaturan data harga produk.

### User

Dapat mengakses data performa pribadi, melihat invoice miliknya, dan memantau riwayat komisi secara mandiri.

---

## Tujuan Pengembangan

Glory Commission System dibuat untuk membantu proses operasional perusahaan menjadi lebih efisien melalui sistem yang terpusat, transparan, dan mudah digunakan.

Dengan sistem ini, proses pengelolaan komisi tidak lagi dilakukan secara manual, sehingga risiko kesalahan data dapat dikurangi dan proses bisnis berjalan lebih efektif.
