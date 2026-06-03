using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CinelogMVC.Services;
using CinelogMVC.DTOs;

namespace CinelogMVC.Controllers;

[ApiController]
[Route("api/lists")]
public class ListController : ControllerBase
{
    private readonly ListService _listService;

    public ListController(ListService listService) => _listService = listService;

    private int GetUserId() => int.Parse(User.FindFirst("id")!.Value);

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId) =>
        Ok(await _listService.GetByUserAsync(userId));

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetWithItems(int id)
    {
        try { return Ok(await _listService.GetWithItemsAsync(id, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateListDTO dto)
    {
        try { return StatusCode(201, await _listService.CreateAsync(dto, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] string name)
    {
        try { return Ok(await _listService.UpdateAsync(id, name, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _listService.DeleteAsync(id, GetUserId());
            return Ok(new { message = "List deleted successfully" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpPost("{id}/items")]
    [Authorize]
    public async Task<IActionResult> AddItem(int id, [FromBody] AddListItemDTO dto)
    {
        try { return Ok(await _listService.AddItemAsync(id, dto.ContentId, GetUserId())); }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }

    [HttpDelete("{id}/items/{contentId}")]
    [Authorize]
    public async Task<IActionResult> RemoveItem(int id, int contentId)
    {
        try
        {
            await _listService.RemoveItemAsync(id, contentId, GetUserId());
            return Ok(new { message = "Item removed" });
        }
        catch (Exception e) { return BadRequest(new { error = e.Message }); }
    }
}