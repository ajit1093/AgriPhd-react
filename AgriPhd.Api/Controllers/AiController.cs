using AgriPhd.Api.DTOs.Ai;
using AgriPhd.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriPhd.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[AllowAnonymous]
public class AiController : ControllerBase
{
    private readonly IAdmissionAiService _aiService;

    public AiController(IAdmissionAiService aiService)
    {
        _aiService = aiService;
    }

    /// <summary>
    /// Multilingual AI Admission Copilot for Ph.D. Admissions 2026-27 (Marathi & English)
    /// </summary>
    [HttpPost("admission-chat")]
    [ProducesResponseType(typeof(AdmissionChatResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> AdmissionChat([FromBody] AdmissionChatRequest request, CancellationToken cancellationToken)
    {
        var response = await _aiService.AnswerAsync(request, cancellationToken);
        return Ok(response);
    }
}
