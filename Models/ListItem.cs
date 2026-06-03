namespace CinelogMVC.Models;

public class ListItem
{
    public int Id { get; set; }
    public int ListId { get; set; }
    public int ContentId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public UserList List { get; set; } = null!;
    public Content Content { get; set; } = null!;
}