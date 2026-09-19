using AdminPanel.Models;

namespace AdminPanel.Services;

public interface IMenuService
{
    IReadOnlyList<MenuItem> GetMenu();

    /// <summary>Jalur dari root ke item (untuk breadcrumb), atau null jika key tidak ada.</summary>
    IReadOnlyList<MenuItem>? FindPath(string key);
}

/// <summary>
/// Menu dummy yang didefinisikan di kode. Nanti bisa diganti implementasi
/// yang membaca dari database tanpa mengubah view.
/// </summary>
public class StaticMenuService : IMenuService
{
    private static MenuItem Page(string key, string title, string icon, string description) =>
        new(key, title, icon, $"/Admin/Page/{key}", description);

    private static MenuItem Group(string key, string title, string icon, params MenuItem[] children) =>
        new(key, title, icon, Children: children);

    private static readonly IReadOnlyList<MenuItem> Menu =
    [
        new("dashboard", "Dashboard", "bi-grid-1x2", "/Admin/Dashboard", "Ringkasan kondisi aplikasi."),

        Group("master", "Master Data", "bi-database",
            Group("master-produk", "Produk", "bi-box-seam",
                Page("produk-daftar", "Daftar Produk", "bi-list-ul", "Kelola data barang yang dijual maupun dibeli."),
                Page("produk-kategori", "Kategori Produk", "bi-tags", "Pengelompokan produk untuk pencarian dan laporan."),
                Page("produk-satuan", "Satuan", "bi-rulers", "Satuan barang seperti PCS, BOX, KG, dan konversinya."),
                Page("produk-merek", "Merek", "bi-award", "Daftar merek produk.")),
            Group("master-mitra", "Mitra Bisnis", "bi-people",
                Page("mitra-pelanggan", "Pelanggan", "bi-person-badge", "Data pelanggan beserta alamat dan batas kredit."),
                Page("mitra-supplier", "Supplier", "bi-truck", "Data pemasok barang.")),
            Page("master-gudang", "Gudang", "bi-building", "Lokasi penyimpanan barang.")),

        Group("transaksi", "Transaksi", "bi-arrow-left-right",
            Group("transaksi-penjualan", "Penjualan", "bi-cart-check",
                Page("jual-order", "Order Penjualan", "bi-cart-plus", "Pesanan dari pelanggan sebelum dikirim."),
                Page("jual-faktur", "Faktur Penjualan", "bi-receipt", "Tagihan penjualan kepada pelanggan."),
                Page("jual-retur", "Retur Penjualan", "bi-arrow-return-left", "Pengembalian barang dari pelanggan.")),
            Group("transaksi-pembelian", "Pembelian", "bi-bag",
                Page("beli-po", "Purchase Order", "bi-file-earmark-text", "Pesanan pembelian ke supplier."),
                Page("beli-terima", "Penerimaan Barang", "bi-box-arrow-in-down", "Pencatatan barang masuk dari supplier."),
                Page("beli-retur", "Retur Pembelian", "bi-arrow-return-right", "Pengembalian barang ke supplier."))),

        Group("persediaan", "Persediaan", "bi-boxes",
            Page("stok-daftar", "Stok Barang", "bi-clipboard-data", "Posisi stok terkini per gudang."),
            Page("stok-mutasi", "Mutasi Stok", "bi-arrow-repeat", "Perpindahan barang antar gudang."),
            Page("stok-opname", "Stock Opname", "bi-clipboard-check", "Penyesuaian stok fisik dengan sistem.")),

        Group("keuangan", "Keuangan", "bi-cash-coin",
            Page("keu-kas", "Kas & Bank", "bi-bank", "Penerimaan dan pengeluaran kas/bank."),
            Page("keu-hutang", "Hutang Usaha", "bi-credit-card", "Kewajiban pembayaran ke supplier."),
            Page("keu-piutang", "Piutang Usaha", "bi-wallet2", "Tagihan yang belum dibayar pelanggan."),
            Page("keu-jurnal", "Jurnal Umum", "bi-journal-text", "Pencatatan jurnal akuntansi manual.")),

        Group("laporan", "Laporan", "bi-bar-chart-line",
            Page("lap-penjualan", "Laporan Penjualan", "bi-graph-up", "Rekap penjualan per periode, produk, dan pelanggan."),
            Page("lap-pembelian", "Laporan Pembelian", "bi-graph-down", "Rekap pembelian per periode dan supplier."),
            Page("lap-stok", "Laporan Stok", "bi-box", "Kartu stok dan nilai persediaan."),
            Page("lap-labarugi", "Laba Rugi", "bi-pie-chart", "Laporan laba rugi per periode.")),

        Group("sistem", "Pengaturan Sistem", "bi-gear",
            Page("sys-user", "Manajemen User", "bi-person-gear", "Tambah, ubah, dan nonaktifkan akun pengguna."),
            Page("sys-role", "Role & Hak Akses", "bi-shield-lock", "Atur role dan menu yang boleh diakses."),
            Page("sys-perusahaan", "Profil Perusahaan", "bi-building-gear", "Nama, alamat, dan logo perusahaan."),
            Page("sys-log", "Log Aktivitas", "bi-clock-history", "Riwayat aktivitas pengguna di aplikasi.")),
    ];

    public IReadOnlyList<MenuItem> GetMenu() => Menu;

    public IReadOnlyList<MenuItem>? FindPath(string key)
    {
        var path = new Stack<MenuItem>();
        return Search(Menu, key, path) ? [.. path.Reverse()] : null;
    }

    private static bool Search(IReadOnlyList<MenuItem> items, string key, Stack<MenuItem> path)
    {
        foreach (var item in items)
        {
            path.Push(item);
            if (string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase)) return true;
            if (item.Children is not null && Search(item.Children, key, path)) return true;
            path.Pop();
        }
        return false;
    }
}
