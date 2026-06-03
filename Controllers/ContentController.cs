using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly ContentService _contentService;

    public ContentController(ContentService contentService) => _contentService = contentService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);
    private bool GetIsAdmin() => bool.Parse(User.FindFirst("is_admin")!.Value);

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? type, [FromQuery] string? search) =>
        Ok(await _contentService.GetAllAsync(type, search));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _contentService.GetByIdAsync(id)); }
        catch (Exception e) { return NotFound(new { error = e.Message }); }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateContentDTO dto)
    {
        try
        {
            if (!GetIsAdmin())
                return StatusCode(403, new { error = "Forbidden: Only admins can add content" });

            return StatusCode(201, await _contentService.CreateAsync(dto, GetUserId()));
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateContentDTO dto)
    {
        try
        {
            if (!GetIsAdmin())
                return StatusCode(403, new { error = "Forbidden: Only admins can update content" });

            return Ok(await _contentService.UpdateAsync(id, dto, GetUserId(), GetIsAdmin()));
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            if (!GetIsAdmin())
                return StatusCode(403, new { error = "Forbidden: Only admins can delete content" });

            await _contentService.DeleteAsync(id, GetUserId(), GetIsAdmin());
            return Ok(new { message = "Content deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}