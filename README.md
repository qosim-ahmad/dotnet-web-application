# dotnet-web-application

Repo latihan pengembangan aplikasi web dengan .NET / ASP.NET Core.

## AdminPanel

Web admin control panel berbasis **ASP.NET Core MVC (.NET 10 LTS)**, **ASP.NET Core Identity**, dan **SQL Server** melalui Entity Framework Core. Dikembangkan dengan **VS Code** dan bisa berjalan di Windows maupun Ubuntu.

### Status fitur

| Tahap | Fitur | Status |
|---|---|---|
| 1 | Login / Logout, Dashboard (statistik user & role) | ✅ Selesai |
| 1b | Menu tree (dummy), tab multi-halaman, search menu (Ctrl+K) | ✅ Selesai |
| 2 | Manajemen User (tambah, ubah, nonaktifkan, reset password, hapus) | ⏳ Berikutnya |
| 3 | Manajemen Role | ⏳ Berikutnya |

### Struktur

```
DotnetWebApplication.slnx         Solution
global.json                       Mengunci versi .NET SDK (10.0.x)
nuget.config                      Sumber paket hanya nuget.org
dotnet-tools.json                 Local tool: dotnet-ef
.vscode/                          Konfigurasi build, debug, dan task VS Code
src/AdminPanel/
├── Program.cs                    Konfigurasi service & pipeline
├── Controllers/AccountController Login / Logout / AccessDenied
├── Areas/Admin/                  Halaman khusus role Admin
│   ├── WorkspaceController       Kerangka utama: sidebar menu + tab
│   ├── DashboardController       Isi tab Dashboard
│   └── PageController            Halaman dummy untuk menu yang belum dibuat
├── Services/MenuService.cs       Definisi menu tree (ubah menu di sini)
├── wwwroot/js/workspace.js       Logika tab, menu tree, dan search menu
├── Data/                         DbContext, seeder, migrations
├── Models/                       ApplicationUser, LoginViewModel
└── Views/                        Layout, halaman login
```

### Prasyarat

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- SQL Server 2019+ (Windows) atau [SQL Server on Linux](https://learn.microsoft.com/sql/linux/sql-server-linux-setup) / Docker (Ubuntu)
- VS Code + ekstensi **C# Dev Kit** (VS Code akan menyarankannya otomatis)

### Menjalankan pertama kali

```bash
# 1. Pasang local tool (dotnet-ef)
dotnet tool restore

# 2. Simpan connection string di User Secrets (TIDAK ikut ke git)
cd src/AdminPanel
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=AdminPanelDb;User Id=sa;Password=PASSWORD_ANDA;TrustServerCertificate=True;MultipleActiveResultSets=True"

# 3. Jalankan. Database dan tabel dibuat otomatis saat start.
dotnet run
```

Buka http://localhost:5022, lalu login dengan akun admin awal (lihat `appsettings.Development.json`):

- Email: `admin@example.com`
- Password: `Admin@12345`

> Akun ini hanya untuk development. Untuk production, atur `SeedAdmin__Email` dan `SeedAdmin__Password` lewat environment variable.

Di VS Code, tekan **F5** untuk menjalankan dengan debugger, atau jalankan task **watch** untuk hot reload.

### Perintah migration

```bash
dotnet ef migrations add NamaMigration -p src/AdminPanel -o Data/Migrations
dotnet ef database update -p src/AdminPanel
```
