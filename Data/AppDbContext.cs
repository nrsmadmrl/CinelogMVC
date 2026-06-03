using Microsoft.EntityFrameworkCore;
using CinelogMVC.Models;

namespace CinelogMVC.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<UserList> Lists { get; set; }
    public DbSet<ListItem> ListItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        // Content - enum string olarak sakla
        modelBuilder.Entity<Content>()
            .Property(c => c.Type)
            .HasConversion<string>();

        // Review - aynı kullanıcı aynı içeriğe bir kez review yapabilir
        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.UserId, r.ContentId }).IsUnique();

        // Like - aynı kullanıcı aynı posta bir kez like atabilir
        modelBuilder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.PostId }).IsUnique();

        // ListItem - aynı içerik aynı listeye bir kez eklenebilir
        modelBuilder.Entity<ListItem>()
            .HasIndex(li => new { li.ListId, li.ContentId }).IsUnique();

        // UserList - enum string olarak sakla
        modelBuilder.Entity<UserList>()
            .Property(ul => ul.Type)
            .HasConversion<string>();

        // Cascade delete ayarları
        modelBuilder.Entity<Post>()
            .HasMany(p => p.Comments)
            .WithOne(c => c.Post)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Post>()
            .HasMany(p => p.Likes)
            .WithOne(l => l.Post)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserList>()
            .HasMany(ul => ul.Items)
            .WithOne(li => li.List)
            .OnDelete(DeleteBehavior.Cascade);
    }
}