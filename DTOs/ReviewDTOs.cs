namespace CinelogMVC.DTOs;

public class CreateReviewDTO
{
    public int ContentId { get; set; }
    public int Rating { get; set; }
    public string? Opinion { get; set; }
}

public class UpdateReviewDTO
{
    public int? Rating { get; set; }
    public string? Opinion { get; set; }
}

public class ReviewResponseDTO
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public int ContentId { get; set; }
    public string ContentTitle { get; set; } = "";
    public string? ContentCoverUrl { get; set; }
    public int Rating { get; set; }
    public string Opinion { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}