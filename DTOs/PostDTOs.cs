namespace CinelogMVC.DTOs;

public class CreatePostDTO
{
    public int? ContentId { get; set; }
    public string Caption { get; set; } = "";
}

public class UpdatePostDTO
{
    public string Caption { get; set; } = "";
}

public class PostResponseDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string? AvatarUrl { get; set; }
    public int? ContentId { get; set; }
    public string? ContentTitle { get; set; }
    public string? ContentType { get; set; }
    public string? ContentCoverUrl { get; set; }
    public string Caption { get; set; } = "";
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}