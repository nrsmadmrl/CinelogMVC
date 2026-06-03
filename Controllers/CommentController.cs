using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/comments")]
public class CommentController : ControllerBase
{
    private readonly CommentService _commentService;

    public CommentController(CommentService commentService) => _commentService = commentService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetByPost(int postId) =>
        Ok(await _commentService.GetByPostAsync(postId));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCommentDTO dto)
    {
        try { return StatusCode(201, await _commentService.CreateAsync(dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCommentDTO dto)
    {
        try { return Ok(await _commentService.UpdateAsync(id, dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _commentService.DeleteAsync(id, GetUserId());
            return Ok(new { message = "Comment deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}