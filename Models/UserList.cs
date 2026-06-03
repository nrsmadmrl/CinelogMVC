namespace CinelogMVC.Models;

public enum ListType { watchlater, custom }

public class UserList
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = "";
    public ListType Type { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public List<ListItem> Items { get; set; } = new();
}
