namespace CinelogMVC.DTOs;

public class CreateCommentDTO
{
    public int PostId { get; set; }
    public string Text { get; set; } = "";
}

public class UpdateCommentDTO
{
    public string Text { get; set; } = "";
}

public class CreateListDTO
{
    public string Name { get; set; } = "";
    public string Type { get; set; } = "custom";
}

public class AddListItemDTO
{
    public int ContentId { get; set; }
}