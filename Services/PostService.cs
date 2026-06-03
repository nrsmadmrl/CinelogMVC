using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class PostService
{
    private readonly AppDbContext _db;

    public PostService(AppDbContext db) => _db = db;

    private async Task<PostResponseDTO> MapToDTO(Post p)
    {
        return new PostResponseDTO
        {
            Id = p.Id,
            UserId = p.UserId,
            Username = p.User.Username,
            AvatarUrl = p.User.AvatarUrl,
            ContentId = p.ContentId,
            ContentTitle = p.Content?.Title,
            ContentType = p.Content?.Type.ToString(),
            ContentCoverUrl = p.Content?.CoverUrl,
            Caption = p.Caption,
            LikeCount = p.Likes.Count,
            CommentCount = p.Comments.Count,
            CreatedAt = p.CreatedAt
        };
    }

    private IQueryable<Post> PostsWithIncludes()
    {
        return _db.Posts
            .Include(p => p.User)
            .Include(p => p.Content)
            .Include(p => p.Likes)
            .Include(p => p.Comments);
    }

    public async Task<List<PostResponseDTO>> GetAllAsync()
    {
        var posts = await PostsWithIncludes()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return await Task.WhenAll(posts.Select(MapToDTO)).ContinueWith(t => t.Result.ToList());
    }

    public async Task<PostResponseDTO> GetByIdAsync(int id)
    {
        var post = await PostsWithIncludes().FirstOrDefaultAsync(p => p.Id == id);
        if (post == null) throw new Exception("Post not found");
        return await MapToDTO(post);
    }

    public async Task<List<PostResponseDTO>> GetByUserAsync(int userId)
    {
        var posts = await PostsWithIncludes()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return await Task.WhenAll(posts.Select(MapToDTO)).ContinueWith(t => t.Result.ToList());
    }

    public async Task<PostResponseDTO> CreateAsync(CreatePostDTO dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Caption) && dto.ContentId == null)
            throw new Exception("Post must have a caption or linked content");

        if (dto.ContentId.HasValue)
        {
            var content = await _db.Contents.FindAsync(dto.ContentId.Value);
            if (content == null) throw new Exception("Content not found");
        }

        var post = new Post
        {
            UserId = userId,
            ContentId = dto.ContentId,
            Caption = dto.Caption
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(post.Id);
    }

    public async Task<PostResponseDTO> UpdateAsync(int id, UpdatePostDTO dto, int userId)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) throw new Exception("Post not found");
        if (post.UserId != userId) throw new Exception("Unauthorized");
        if (string.IsNullOrWhiteSpace(dto.Caption)) throw new Exception("Caption is required");

        post.Caption = dto.Caption;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) throw new Exception("Post not found");
        if (post.UserId != userId) throw new Exception("Unauthorized");

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
    }
}