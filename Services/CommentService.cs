using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class CommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db) => _db = db;

    public async Task<List<object>> GetByPostAsync(int postId)
    {
        return await _db.Comments
            .Include(c => c.User)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => (object)new
            {
                c.Id,
                c.UserId,
                c.User.Username,
                c.User.AvatarUrl,
                c.PostId,
                c.Text,
                c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<object> CreateAsync(CreateCommentDTO dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Text)) throw new Exception("Comment text is required");

        var post = await _db.Posts.FindAsync(dto.PostId);
        if (post == null) throw new Exception("Post not found");

        var comment = new Comment
        {
            UserId = userId,
            PostId = dto.PostId,
            Text = dto.Text.Trim()
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();
        await _db.Entry(comment).Reference(c => c.User).LoadAsync();

        return new
        {
            comment.Id,
            comment.UserId,
            comment.User.Username,
            comment.PostId,
            comment.Text,
            comment.CreatedAt
        };
    }

    public async Task<object> UpdateAsync(int id, UpdateCommentDTO dto, int userId)
    {
        var comment = await _db.Comments.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        if (comment == null) throw new Exception("Comment not found");
        if (comment.UserId != userId) throw new Exception("Unauthorized");
        if (string.IsNullOrWhiteSpace(dto.Text)) throw new Exception("Comment text is required");

        comment.Text = dto.Text.Trim();
        await _db.SaveChangesAsync();

        return new
        {
            comment.Id,
            comment.UserId,
            comment.User.Username,
            comment.PostId,
            comment.Text,
            comment.CreatedAt
        };
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var comment = await _db.Comments.FindAsync(id);
        if (comment == null) throw new Exception("Comment not found");
        if (comment.UserId != userId) throw new Exception("Unauthorized");

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
    }
}