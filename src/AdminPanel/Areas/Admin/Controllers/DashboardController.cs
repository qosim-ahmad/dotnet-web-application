using AdminPanel.Areas.Admin.Models;
using AdminPanel.Data;
using AdminPanel.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdminPanel.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = Roles.Admin)]
public class DashboardController(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager) : Controller
{
    // GET: /Admin atau /Admin/Dashboard
    public async Task<IActionResult> Index()
    {
        var now = DateTimeOffset.UtcNow;
        var totalUsers = await db.Users.CountAsync();
        var inactiveUsers = await db.Users.CountAsync(u => u.LockoutEnd != null && u.LockoutEnd > now);

        var recent = await db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentItems = new List<UserListItem>();
        foreach (var u in recent)
        {
            var roles = await userManager.GetRolesAsync(u);
            recentItems.Add(new UserListItem(u.Id, u.FullName, u.Email ?? "", [.. roles], u.IsActive, u.CreatedAt));
        }

        return View(new DashboardViewModel(
            totalUsers,
            totalUsers - inactiveUsers,
            inactiveUsers,
            await db.Roles.CountAsync(),
            recentItems));
    }
}
