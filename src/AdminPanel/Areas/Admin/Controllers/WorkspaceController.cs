using AdminPanel.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdminPanel.Areas.Admin.Controllers;

/// <summary>
/// Kerangka utama admin: sidebar menu tree + tab. Setiap halaman lain
/// dimuat di dalam tab (iframe).
/// </summary>
[Area("Admin")]
[Authorize(Roles = Roles.Admin)]
public class WorkspaceController : Controller
{
    // GET: /Admin atau /Admin?open=/Admin/Page/produk-daftar
    public IActionResult Index(string? open)
    {
        // Hanya izinkan membuka halaman di dalam area Admin
        ViewData["OpenUrl"] = Url.IsLocalUrl(open) && open!.StartsWith("/Admin/", StringComparison.OrdinalIgnoreCase)
            ? open
            : null;
        return View();
    }
}
