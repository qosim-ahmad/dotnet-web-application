using Microsoft.AspNetCore.Identity;

namespace AdminPanel.Models;

/// <summary>
/// User aplikasi. Mewarisi IdentityUser (Email, UserName, PasswordHash, dll.)
/// dan menambahkan kolom khusus admin panel.
/// </summary>
public class ApplicationUser : IdentityUser
{
    [PersonalData]
    public string FullName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// User dinonaktifkan memakai mekanisme lockout bawaan Identity,
    /// sehingga login otomatis ditolak tanpa kode tambahan.
    /// </summary>
    public bool IsActive => LockoutEnd is null || LockoutEnd <= DateTimeOffset.UtcNow;
}
