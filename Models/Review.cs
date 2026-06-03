namespace CinelogMVC.Models;

public class Review
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ContentId { get; set; }
    public int Rating { get; set; }
    public string Opinion { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Content Content { get; set; } = null!;
}