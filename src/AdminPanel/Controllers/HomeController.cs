using System.Diagnostics;
using AdminPanel.Models;
using Microsoft.AspNetCore.Mvc;

namespace AdminPanel.Controllers;

public class HomeController : Controller
{
    // Halaman utama langsung diarahkan ke workspace admin
    // (akan diarahkan ke halaman login jika belum masuk).
    public IActionResult Index() => RedirectToAction("Index", "Workspace", new { area = "Admin" });

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
