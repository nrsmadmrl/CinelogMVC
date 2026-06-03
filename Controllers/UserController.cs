using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService) => _userService = userService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);
    private bool GetIsAdmin() => bool.Parse(User.FindFirst("is_admin")!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _userService.GetAllUsersAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _userService.GetUserByIdAsync(id)); }
        catch (Exception e) { return NotFound(new { error = e.Message }); }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        try { return StatusCode(201, await _userService.RegisterAsync(dto)); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        try { return Ok(await _userService.LoginAsync(dto)); }
        catch (Exception e) { return Unauthorized(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDTO dto)
    {
        try
        {
            if (GetUserId() != id && !GetIsAdmin())
                return StatusCode(403, new { error = "Forbidden: You can only update your own profile" });

            return Ok(await _userService.UpdateUserAsync(id, dto));
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            if (GetUserId() != id && !GetIsAdmin())
                return StatusCode(403, new { error = "Forbidden: You can only delete your own account" });

            await _userService.DeleteUserAsync(id);
            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}