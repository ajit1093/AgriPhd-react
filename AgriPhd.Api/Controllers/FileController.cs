using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// P2-A-12: GET /api/v1/files/view?url=&amp;fileName=
/// Streams a file from Azure Blob Storage to the browser.
///
/// Mirrors legacy Public/ViewFile.aspx which called Helper.DownloadFilesFromBlob().
/// Content-Disposition: inline so the browser renders PDFs and images in-place.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/files")]
[AllowAnonymous]
public class FileController : ControllerBase
{
    private readonly BlobStorageHelper _blob;
    private readonly ILogger<FileController> _logger;

    public FileController(BlobStorageHelper blob, ILogger<FileController> logger)
    {
        _blob   = blob;
        _logger = logger;
    }

    /// <summary>
    /// Streams a blob file to the browser inline (no forced download).
    /// url:      full Azure Blob URL
    /// fileName: display filename shown in browser tab / download dialog
    /// </summary>
    [HttpGet("view")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ViewFile(
        [FromQuery] string url,
        [FromQuery] string fileName = "document")
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { message = "url parameter is required." });

        var (stream, contentType, displayName) = await _blob.DownloadBlobAsync(url, fileName);

        if (stream == null)
            return NotFound(new { message = "File not found." });

        // Content-Disposition: inline — browser renders PDF/image in-place
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{displayName}\"";
        return File(stream, contentType);
    }

    /// <summary>
    /// Forces a file download (Content-Disposition: attachment).
    /// Used for letter downloads, receipt downloads, etc.
    /// </summary>
    [HttpGet("download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadFile(
        [FromQuery] string url,
        [FromQuery] string fileName = "document")
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest(new { message = "url parameter is required." });

        var (stream, contentType, displayName) = await _blob.DownloadBlobAsync(url, fileName);

        if (stream == null)
            return NotFound(new { message = "File not found." });

        return File(stream, contentType, displayName);
    }
}
