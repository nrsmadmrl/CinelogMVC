using CinelogMVC.Models;

namespace CinelogMVC.DTOs;

public class CreateContentDTO
{
    public string Title { get; set; } = "";
    public ContentType Type { get; set; }
    public string? Genre { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
}

public class UpdateContentDTO
{
    public string? Title { get; set; }
    public string? Genre { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
}