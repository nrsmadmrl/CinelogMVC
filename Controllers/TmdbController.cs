using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/tmdb")]
public class TmdbController : ControllerBase
{
    private readonly TmdbService _tmdbService;
    private readonly ContentService _contentService;

    public TmdbController(TmdbService tmdbService, ContentService contentService)
    {
        _tmdbService = tmdbService;
        _contentService = contentService;
    }

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);
    private bool GetIsAdmin() => bool.Parse(User.FindFirst("is_admin")!.Value);

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] string? type)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest(new { error = "Query is required" });

        var results = type switch
        {
            "film" => await _tmdbService.SearchMoviesAsync(q),
            "series" => await _tmdbService.SearchSeriesAsync(q),
            _ => await _tmdbService.SearchAllAsync(q)
        };

        return Ok(results);
    }

    [HttpPost("import")]
    [Authorize]
    public async Task<IActionResult> Import([FromBody] CreateContentDTO dto)
    {
        try
        {
            if (!GetIsAdmin())
                return StatusCode(403, new { error = "Admins only" });

            return StatusCode(201, await _contentService.CreateAsync(dto, GetUserId()));
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}