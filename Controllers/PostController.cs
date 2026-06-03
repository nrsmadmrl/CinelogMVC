using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly PostService _postService;

    public PostController(PostService postService) => _postService = postService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _postService.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _postService.GetByIdAsync(id)); }
        catch (Exception e) { return NotFound(new { error = e.Message }); }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId) =>
        Ok(await _postService.GetByUserAsync(userId));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreatePostDTO dto)
    {
        try { return StatusCode(201, await _postService.CreateAsync(dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePostDTO dto)
    {
        try { return Ok(await _postService.UpdateAsync(id, dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _postService.DeleteAsync(id, GetUserId());
            return Ok(new { message = "Post deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}