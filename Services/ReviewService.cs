using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class ReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db) => _db = db;

    public async Task<List<ReviewResponseDTO>> GetByContentAsync(int contentId)
    {
        return await _db.Reviews
            .Include(r => r.User)
            .Where(r => r.ContentId == contentId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToDTO(r))
            .ToListAsync();
    }

    public async Task<List<ReviewResponseDTO>> GetByUserAsync(int userId)
{
    return await _db.Reviews
        .Include(r => r.User)
        .Include(r => r.Content)
        .Where(r => r.UserId == userId)
        .OrderByDescending(r => r.CreatedAt)
        .Select(r => new ReviewResponseDTO
        {
            Id = r.Id,
            UserId = r.UserId,
            Username = r.User.Username,
            ContentId = r.ContentId,
            ContentTitle = r.Content.Title,
            ContentCoverUrl = r.Content.CoverUrl,
            Rating = r.Rating,
            Opinion = r.Opinion,
            CreatedAt = r.CreatedAt
        })
        .ToListAsync();
}

    public async Task<object> GetAverageRatingAsync(int contentId)
    {
        var reviews = await _db.Reviews.Where(r => r.ContentId == contentId).ToListAsync();
        var average = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
        return new { average = Math.Round(average, 1), total = reviews.Count };
    }

    public async Task<ReviewResponseDTO> CreateAsync(CreateReviewDTO dto, int userId)
    {
        if (dto.Rating < 1 || dto.Rating > 10) throw new Exception("Rating must be between 1 and 10");

        var content = await _db.Contents.FindAsync(dto.ContentId);
        if (content == null) throw new Exception("Content not found");

        var existing = await _db.Reviews.AnyAsync(r => r.UserId == userId && r.ContentId == dto.ContentId);
        if (existing) throw new Exception("You have already reviewed this content");

        var review = new Review
        {
            UserId = userId,
            ContentId = dto.ContentId,
            Rating = dto.Rating,
            Opinion = dto.Opinion ?? ""
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        await _db.Entry(review).Reference(r => r.User).LoadAsync();
        return MapToDTO(review);
    }

    public async Task<ReviewResponseDTO> UpdateAsync(int id, UpdateReviewDTO dto, int userId)
    {
        var review = await _db.Reviews.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) throw new Exception("Review not found");
        if (review.UserId != userId) throw new Exception("Unauthorized");

        if (dto.Rating.HasValue)
        {
            if (dto.Rating < 1 || dto.Rating > 10) throw new Exception("Rating must be between 1 and 10");
            review.Rating = dto.Rating.Value;
        }
        if (dto.Opinion != null) review.Opinion = dto.Opinion;

        await _db.SaveChangesAsync();
        return MapToDTO(review);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var review = await _db.Reviews.FindAsync(id);
        if (review == null) throw new Exception("Review not found");
        if (review.UserId != userId) throw new Exception("Unauthorized");

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
    }

    private static ReviewResponseDTO MapToDTO(Review r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        Username = r.User.Username,
        ContentId = r.ContentId,
        Rating = r.Rating,
        Opinion = r.Opinion,
        CreatedAt = r.CreatedAt
    };
}