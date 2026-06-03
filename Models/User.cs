namespace CinelogMVC.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Bio { get; set; } = "";
    public string AvatarUrl { get; set; } = "";
    public bool IsAdmin { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public List<Post> Posts { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
    public List<Like> Likes { get; set; } = new();
    public List<UserList> Lists { get; set; } = new();
}