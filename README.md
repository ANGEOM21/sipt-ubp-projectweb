# 📚 SIPT-UBP (Frontend)

Project ini adalah aplikasi web berbasis **React + TypeScript + Vite** yang dikembangkan untuk Universitas Buana Perjuangan (UBP) Karawang.  
Dibuat dengan clean architecture, state management via **Zustand**, dan sudah siap deploy ke **Vercel** 🚀.

---

## ✨ Fitur Utama
- 🔐 **Autentikasi** Mahasiswa
- 🏠 **Halaman Home** dengan banner & informasi
- 📊 **Dashboard** untuk menampilkan data akademik
- 📑 **Nilai Mahasiswa** dengan integrasi API
- 👤 **Profile Management**
- ⚠️ **Not Found Page (404)** handling

---

## 📦 Struktur Folder
```
📦 sipt-ubp
┣ 📂public            → asset publik (favicon, logo)
┣ 📂src
┃ ┣ 📂assets          → asset tambahan (img, svg, dll)
┃ ┣ 📂components      → komponen global
┃ ┃ ┣ 📂ui            → komponen UI kecil (skeleton, dll)
┃ ┣ 📂lib             → konfigurasi axios & helper utils
┃ ┣ 📂pages           → halaman aplikasi (Home, Dashboard, Profile, dll)
┃ ┣ 📂store           → state management (Zustand)
┃ ┣ 📂types           → deklarasi tipe global
┃ ┣ 📜App.tsx         → router & layout utama
┃ ┣ 📜main.tsx        → entry point React
┣ 📜vite.config.ts    → konfigurasi Vite
┣ 📜tsconfig.json     → konfigurasi TypeScript
┣ 📜.env              → environment variables
┗ 📜package.json      → dependencies & scripts

```

---

## ⚙️ Tech Stack
- ⚛️ [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)  
- 🟦 TypeScript  
- 🪝 [Zustand](https://github.com/pmndrs/zustand) (state management)  
- 🎨 [Tailwind CSS](https://tailwindcss.com/)  
- 📡 Axios (API client)  

---

## 🚀 Cara Menjalankan Lokal

1. **Clone repo**
   ```bash
   git clone https://github.com/username/sipt-ubp.git
   cd sipt-ubp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Copy file `.env.example` ke `.env`** (jika tersedia) lalu isi variable environment:
   ```
   VITE_API_URL=https://api-sipt-proxy.vercel.app
   ```

4. **Jalankan mode development**

   ```bash
   npm run dev
   ```

   Akses di: `http://localhost:5173`

5. **Build untuk production**

   ```bash
   npm run build
   npm run preview
   ```

---

## 🌐 Deployment (Vercel)

Project ini sudah disiapkan untuk deploy ke **Vercel**.
Setting build di Vercel:

* **Framework Preset**: `Vite`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variables**: isi sesuai `.env`

Setelah push ke GitHub → Vercel akan auto-build & auto-deploy.

---

## 📌 Catatan Developer

* Case-sensitive di Linux (misal `NotFoundPage.tsx` harus konsisten)
* Jangan commit `.env`
* Gunakan `forceConsistentCasingInFileNames: true` di tsconfig

---

## 👽 Author

Dibuat dengan ❤️ oleh **projectweb👽**