using AgriPhd.Api.DTOs.Ai;

namespace AgriPhd.Api.Services.Interfaces;

public interface IAdmissionAiService
{
    Task<AdmissionChatResponse> AnswerAsync(AdmissionChatRequest request, CancellationToken cancellationToken = default);
}
