using Microsoft.EntityFrameworkCore;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class ListService
{
    private readonly AppDbContext _db;

    public ListService(AppDbContext db) => _db = db;

    public async Task<List<object>> GetByUserAsync(int userId)
{
    var lists = await _db.Lists
        .Include(l => l.Items)
        .Where(l => l.UserId == userId)
        .OrderByDescending(l => l.CreatedAt)
        .ToListAsync();

    return lists.Select(l => (object)new
    {
        l.Id, l.UserId, l.Name,
        Type = l.Type.ToString(),
        l.CreatedAt,
        ItemCount = l.Items.Count
    }).ToList();
}

    public async Task<object> GetWithItemsAsync(int id, int userId)
    {
        var list = await _db.Lists.Include(l => l.Items)
            .ThenInclude(i => i.Content)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (list == null) throw new Exception("List not found");
        if (list.UserId != userId) throw new Exception("Unauthorized");

        return new
        {
            list.Id, list.UserId, list.Name,
            Type = list.Type.ToString(),
            list.CreatedAt,
            Items = list.Items.Select(i => new
            {
                i.Id, i.ContentId,
                i.Content.Title,
                ContentType = i.Content.Type.ToString(),
                i.Content.CoverUrl,
                i.AddedAt
            })
        };
    }

    public async Task<UserList> CreateAsync(CreateListDTO dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Name)) throw new Exception("List name is required");
        if (!Enum.TryParse<ListType>(dto.Type, out var listType))
            throw new Exception("Type must be watchlater or custom");

        var list = new UserList { UserId = userId, Name = dto.Name.Trim(), Type = listType };
        _db.Lists.Add(list);
        await _db.SaveChangesAsync();
        return list;
    }

    public async Task<UserList> UpdateAsync(int id, string name, int userId)
    {
        var list = await _db.Lists.FindAsync(id);
        if (list == null) throw new Exception("List not found");
        if (list.UserId != userId) throw new Exception("Unauthorized");
        if (string.IsNullOrWhiteSpace(name)) throw new Exception("List name is required");

        list.Name = name.Trim();
        await _db.SaveChangesAsync();
        return list;
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var list = await _db.Lists.FindAsync(id);
        if (list == null) throw new Exception("List not found");
        if (list.UserId != userId) throw new Exception("Unauthorized");

        _db.Lists.Remove(list);
        await _db.SaveChangesAsync();
    }

    public async Task<object> AddItemAsync(int listId, int contentId, int userId)
    {
        var list = await _db.Lists.FindAsync(listId);
        if (list == null) throw new Exception("List not found");
        if (list.UserId != userId) throw new Exception("Unauthorized");

        var content = await _db.Contents.FindAsync(contentId);
        if (content == null) throw new Exception("Content not found");

        var existing = await _db.ListItems.AnyAsync(li => li.ListId == listId && li.ContentId == contentId);
        if (existing) throw new Exception("Content already in list");

        _db.ListItems.Add(new ListItem { ListId = listId, ContentId = contentId });
        await _db.SaveChangesAsync();
        return new { message = "Content added to list" };
    }

    public async Task RemoveItemAsync(int listId, int contentId, int userId)
    {
        var list = await _db.Lists.FindAsync(listId);
        if (list == null) throw new Exception("List not found");
        if (list.UserId != userId) throw new Exception("Unauthorized");

        var item = await _db.ListItems.FirstOrDefaultAsync(li => li.ListId == listId && li.ContentId == contentId);
        if (item != null)
        {
            _db.ListItems.Remove(item);
            await _db.SaveChangesAsync();
        }
    }
}