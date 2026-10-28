namespace AgriPhd.Api.DTOs.Ai;

public class AdmissionChatRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Language { get; set; }
    public List<ChatMessageItem>? History { get; set; }
}

public class ChatMessageItem
{
    public string Role { get; set; } = "user";
    public string Content { get; set; } = string.Empty;
}

public class AdmissionChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public string Language { get; set; } = "en";
    public List<string> Suggestions { get; set; } = new();
    public List<string> RelatedTopics { get; set; } = new();
}
