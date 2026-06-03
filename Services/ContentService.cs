using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class ContentService
{
    private readonly AppDbContext _db;

    public ContentService(AppDbContext db) => _db = db;

    public async Task<List<Content>> GetAllAsync(string? type, string? search)
    {
        var query = _db.Contents.AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<ContentType>(type, out var t))
            query = query.Where(c => c.Type == t);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Title.ToLower().Contains(search.ToLower()));

        return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
    }

    public async Task<Content> GetByIdAsync(int id)
    {
        var content = await _db.Contents.FindAsync(id);
        if (content == null) throw new Exception("Content not found");
        return content;
    }

    public async Task<Content> CreateAsync(CreateContentDTO dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Title)) throw new Exception("Title is required");
        if (dto.ReleaseYear.HasValue && (dto.ReleaseYear < 1800 || dto.ReleaseYear > DateTime.Now.Year + 1))
            throw new Exception("Invalid release year");

        var content = new Content
        {
            Title = dto.Title,
            Type = dto.Type,
            Genre = dto.Genre ?? "",
            ReleaseYear = dto.ReleaseYear,
            Description = dto.Description ?? "",
            CoverUrl = dto.CoverUrl ?? "",
            CreatedBy = userId
        };

        _db.Contents.Add(content);
        await _db.SaveChangesAsync();
        return content;
    }

    public async Task<Content> UpdateAsync(int id, UpdateContentDTO dto, int userId, bool isAdmin)
    {
        var content = await _db.Contents.FindAsync(id);
        if (content == null) throw new Exception("Content not found");
        if (!isAdmin && content.CreatedBy != userId) throw new Exception("Unauthorized");

        if (!string.IsNullOrWhiteSpace(dto.Title)) content.Title = dto.Title;
        if (dto.Genre != null) content.Genre = dto.Genre;
        if (dto.ReleaseYear.HasValue) content.ReleaseYear = dto.ReleaseYear;
        if (dto.Description != null) content.Description = dto.Description;
        if (dto.CoverUrl != null) content.CoverUrl = dto.CoverUrl;

        await _db.SaveChangesAsync();
        return content;
    }

    public async Task DeleteAsync(int id, int userId, bool isAdmin)
    {
        var content = await _db.Contents.FindAsync(id);
        if (content == null) throw new Exception("Content not found");
        if (!isAdmin && content.CreatedBy != userId) throw new Exception("Unauthorized");

        _db.Contents.Remove(content);
        await _db.SaveChangesAsync();
    }
}