using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinelogMVC.Data;
using CinelogMVC.DTOs;
using CinelogMVC.Models;

namespace CinelogMVC.Services;

public class UserService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public UserService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<List<UserResponseDTO>> GetAllUsersAsync()
    {
        return await _db.Users.Select(u => MapToDTO(u)).ToListAsync();
    }

    public async Task<UserResponseDTO> GetUserByIdAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) throw new Exception("User not found");
        return MapToDTO(user);
    }

    public async Task<AuthResponseDTO> RegisterAsync(RegisterDTO dto)
{
    if (string.IsNullOrWhiteSpace(dto.Username)) throw new Exception("Username is required");
    if (string.IsNullOrWhiteSpace(dto.Email)) throw new Exception("Email is required");
    if (string.IsNullOrWhiteSpace(dto.Password)) throw new Exception("Password is required");
    if (dto.Password.Length < 6) throw new Exception("Password must be at least 6 characters");
    if (!dto.Email.Contains("@")) throw new Exception("Invalid email format");

    var isFirstUser = !await _db.Users.AnyAsync();

    Console.WriteLine($">>> isFirstUser: {isFirstUser}, UserCount: {await _db.Users.CountAsync()}");


    var existing = await _db.Users.AnyAsync(u => u.Email == dto.Email || u.Username == dto.Username);
    if (existing) throw new Exception("Username or email already exists");

    var user = new User
    {
        Username = dto.Username,
        Email = dto.Email,
        Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        IsAdmin = isFirstUser
    };

    _db.Users.Add(user);
    await _db.SaveChangesAsync();

    return new AuthResponseDTO
    {
        Token = GenerateToken(user),
        User = MapToDTO(user)
    };
}

    public async Task<AuthResponseDTO> LoginAsync(LoginDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new Exception("All fields are required");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            throw new Exception("Invalid email or password");

        return new AuthResponseDTO
        {
            Token = GenerateToken(user),
            User = MapToDTO(user)
        };
    }

    public async Task<UserResponseDTO> UpdateUserAsync(int id, UpdateUserDTO dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) throw new Exception("User not found");

        if (!string.IsNullOrWhiteSpace(dto.Username)) user.Username = dto.Username;
        if (dto.Bio != null) user.Bio = dto.Bio;
        if (dto.AvatarUrl != null) user.AvatarUrl = dto.AvatarUrl;

        await _db.SaveChangesAsync();
        return MapToDTO(user);
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) throw new Exception("User not found");
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    private string GenerateToken(User user)
    {
        var secret = _config["Jwt:Secret"] ?? "cinelog_secret_key_2026";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("id", user.Id.ToString()),
            new Claim("username", user.Username),
            new Claim("is_admin", user.IsAdmin.ToString())
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static UserResponseDTO MapToDTO(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Email = u.Email,
        Bio = u.Bio,
        AvatarUrl = u.AvatarUrl,
        IsAdmin = u.IsAdmin,
        CreatedAt = u.CreatedAt
    };
}