using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/likes")]
public class LikeController : ControllerBase
{
    private readonly LikeService _likeService;

    public LikeController(LikeService likeService) => _likeService = likeService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetByPost(int postId) =>
        Ok(await _likeService.GetLikesByPostAsync(postId));

    [HttpPost("post/{postId}/toggle")]
    [Authorize]
    public async Task<IActionResult> Toggle(int postId)
    {
        try { return Ok(await _likeService.ToggleLikeAsync(postId, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpGet("post/{postId}/status")]
    [Authorize]
    public async Task<IActionResult> Status(int postId) =>
        Ok(await _likeService.IsLikedAsync(postId, GetUserId()));
}