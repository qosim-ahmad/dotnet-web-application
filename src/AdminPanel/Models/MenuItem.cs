namespace AdminPanel.Models;

/// <summary>
/// Satu node di menu tree. Node dengan Children = grup (hanya membuka/menutup),
/// node tanpa Children = halaman yang dibuka di tab.
/// </summary>
public sealed record MenuItem(
    string Key,
    string Title,
    string Icon,
    string? Url = null,
    string? Description = null,
    IReadOnlyList<MenuItem>? Children = null)
{
    public bool IsGroup => Children is { Count: > 0 };
}
