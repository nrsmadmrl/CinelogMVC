using CinelogMVC.DTOs;
using CinelogMVC.Models;
using System.Text.Json.Serialization;

namespace CinelogMVC.Services;

public class TmdbService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;
    private const string BaseUrl = "https://api.themoviedb.org/3";
    private const string ImageBase = "https://image.tmdb.org/t/p/w500";

    public TmdbService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["Tmdb:ApiKey"] ?? "";
    }

    public async Task<List<CreateContentDTO>> SearchMoviesAsync(string query)
    {
        var url = $"{BaseUrl}/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&language=en-US";
        var response = await _http.GetFromJsonAsync<TmdbResponse>(url);
        return response?.Results.Take(8).Select(m => new CreateContentDTO
        {
            Title = m.Title ?? m.Name ?? "",
            Type = ContentType.film,
            Description = m.Overview,
            ReleaseYear = ParseYear(m.ReleaseDate ?? m.FirstAirDate),
            CoverUrl = m.PosterPath != null ? $"{ImageBase}{m.PosterPath}" : ""
        }).ToList() ?? new();
    }

    public async Task<List<CreateContentDTO>> SearchSeriesAsync(string query)
    {
        var url = $"{BaseUrl}/search/tv?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&language=en-US";
        var response = await _http.GetFromJsonAsync<TmdbResponse>(url);
        return response?.Results.Take(8).Select(s => new CreateContentDTO
        {
            Title = s.Name ?? s.Title ?? "",
            Type = ContentType.series,
            Description = s.Overview,
            ReleaseYear = ParseYear(s.FirstAirDate ?? s.ReleaseDate),
            CoverUrl = s.PosterPath != null ? $"{ImageBase}{s.PosterPath}" : ""
        }).ToList() ?? new();
    }

    public async Task<List<CreateContentDTO>> SearchAllAsync(string query)
    {
        var movies = await SearchMoviesAsync(query);
        var series = await SearchSeriesAsync(query);
        return movies.Concat(series).ToList();
    }

    private static int? ParseYear(string? date) =>
        int.TryParse(date?.Split("-")[0], out var y) ? y : null;
}

// TMDB API response modelleri
public class TmdbResponse
{
    public List<TmdbItem> Results { get; set; } = new();
}

public class TmdbItem
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Name { get; set; }
    public string? Overview { get; set; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; set; }

    [JsonPropertyName("release_date")]
    public string? ReleaseDate { get; set; }

    [JsonPropertyName("first_air_date")]
    public string? FirstAirDate { get; set; }
}