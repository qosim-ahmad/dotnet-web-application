namespace AdminPanel.Areas.Admin.Models;

public record DashboardViewModel(
    int TotalUsers,
    int ActiveUsers,
    int InactiveUsers,
    int TotalRoles,
    IReadOnlyList<UserListItem> RecentUsers);

public record UserListItem(
    string Id,
    string FullName,
    string Email,
    IReadOnlyList<string> Roles,
    bool IsActive,
    DateTime CreatedAt);
