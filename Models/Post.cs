namespace CinelogMVC.Models;

public class Post
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? ContentId { get; set; }
    public string Caption { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Content? Content { get; set; }
    public List<Comment> Comments { get; set; } = new();
    public List<Like> Likes { get; set; } = new();
}