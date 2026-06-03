using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewController(ReviewService reviewService) => _reviewService = reviewService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet("content/{contentId}")]
    public async Task<IActionResult> GetByContent(int contentId) =>
        Ok(await _reviewService.GetByContentAsync(contentId));

    [HttpGet("content/{contentId}/average")]
    public async Task<IActionResult> GetAverage(int contentId) =>
        Ok(await _reviewService.GetAverageRatingAsync(contentId));

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId) =>
        Ok(await _reviewService.GetByUserAsync(userId));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewDTO dto)
    {
        try { return StatusCode(201, await _reviewService.CreateAsync(dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewDTO dto)
    {
        try { return Ok(await _reviewService.UpdateAsync(id, dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _reviewService.DeleteAsync(id, GetUserId());
            return Ok(new { message = "Review deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}