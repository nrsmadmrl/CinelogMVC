using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class LikeService
{
    private readonly AppDbContext _db;

    public LikeService(AppDbContext db) => _db = db;

    public async Task<object> ToggleLikeAsync(int postId, int userId)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post == null) throw new Exception("Post not found");

        var existing = await _db.Likes.FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);

        if (existing != null)
        {
            _db.Likes.Remove(existing);
            await _db.SaveChangesAsync();
            return new { liked = false, message = "Like removed" };
        }
        else
        {
            _db.Likes.Add(new Like { UserId = userId, PostId = postId });
            await _db.SaveChangesAsync();
            return new { liked = true, message = "Post liked" };
        }
    }

    public async Task<object> IsLikedAsync(int postId, int userId)
    {
        var liked = await _db.Likes.AnyAsync(l => l.UserId == userId && l.PostId == postId);
        return new { liked };
    }

    public async Task<List<object>> GetLikesByPostAsync(int postId)
    {
        return await _db.Likes
            .Include(l => l.User)
            .Where(l => l.PostId == postId)
            .Select(l => (object)new { l.Id, l.UserId, l.User.Username, l.PostId })
            .ToListAsync();
    }
}