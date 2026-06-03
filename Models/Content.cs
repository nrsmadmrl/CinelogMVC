namespace CinelogMVC.Models;

public enum ContentType { film, series, Documentary }

public class Content
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public ContentType Type { get; set; }
    public string Genre { get; set; } = "";
    public int? ReleaseYear { get; set; }
    public string Description { get; set; } = "";
    public string CoverUrl { get; set; } = "";
    public int CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Review> Reviews { get; set; } = new();
    public List<Post> Posts { get; set; } = new();
    public List<ListItem> ListItems { get; set; } = new();
}