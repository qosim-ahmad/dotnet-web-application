using AdminPanel.Data;
using AdminPanel.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdminPanel.Areas.Admin.Controllers;

/// <summary>
/// Halaman dummy untuk setiap menu yang belum dibuat. Nanti tiap menu
/// diganti controller/halaman sungguhan satu per satu.
/// </summary>
[Area("Admin")]
[Authorize(Roles = Roles.Admin)]
public class PageController(IMenuService menu) : Controller
{
    // GET: /Admin/Page/{id}
    [HttpGet("Admin/Page/{id}")]
    public IActionResult Index(string id)
    {
        var path = menu.FindPath(id);
        if (path is null || path[^1].IsGroup)
        {
            Response.StatusCode = StatusCodes.Status404NotFound;
            return View("NotFound", id);
        }

        return View(path);
    }
}
