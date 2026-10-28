using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using AgriPhd.Api.Models;

namespace AgriPhd.Api.Helpers;

/// <summary>
/// Azure Blob Storage helper using Azure.Storage.Blobs SDK (replaces legacy WindowsAzure.Storage).
/// Ported from legacy App_Code/Helper.cs DownloadFilesFromBlob().
///
/// Legacy used CloudStorageAccount → CloudBlobClient → CloudBlobContainer → CloudBlockBlob.
/// New SDK uses BlobServiceClient → BlobContainerClient → BlobClient.
/// Behaviour preserved: Content-Disposition: inline (browser renders in-place).
/// </summary>
public class BlobStorageHelper
{
    private readonly AzureBlobStorageSettings _settings;
    private readonly ILogger<BlobStorageHelper> _logger;

    public BlobStorageHelper(IOptions<AzureBlobStorageSettings> settings, ILogger<BlobStorageHelper> logger)
    {
        _settings = settings.Value;
        _logger   = logger;
    }

    /// <summary>
    /// Downloads a blob by its full URL.
    /// Extracts the blob name from the URL path (matches legacy CloudBlockBlob(uri).Name pattern).
    /// Returns null if the blob does not exist or URL is invalid.
    /// </summary>
    public async Task<(Stream? content, string contentType, string fileName)> DownloadBlobAsync(
        string blobUrl, string displayFileName)
    {
        try
        {
            var uri = new Uri(blobUrl);
            // Extract blob name: everything after the container segment
            // e.g. https://account.blob.core.windows.net/container/folder/file.pdf → folder/file.pdf
            var pathSegments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
            var blobName = pathSegments.Length > 1 ? pathSegments[1] : pathSegments[0];

            var client = new BlobClient(_settings.ConnectionString, _settings.ContainerName, blobName);

            if (!await client.ExistsAsync())
            {
                _logger.LogWarning("Blob not found: {BlobUrl}", blobUrl);
                return (null, string.Empty, string.Empty);
            }

            var download = await client.DownloadStreamingAsync();
            var contentType = download.Value.Details.ContentType ?? "application/octet-stream";

            return (download.Value.Content, contentType, displayFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download blob {BlobUrl}", blobUrl);
            return (null, string.Empty, string.Empty);
        }
    }

    /// <summary>
    /// Uploads a stream to Azure Blob Storage and returns the public URL.
    /// Used by document upload endpoints in Phase 2 Batch D.
    /// </summary>
    public async Task<string?> UploadBlobAsync(
        Stream content, string blobPath, string contentType, bool overwrite = true)
    {
        try
        {
            var client = new BlobClient(_settings.ConnectionString, _settings.ContainerName, blobPath);
            var options = new Azure.Storage.Blobs.Models.BlobUploadOptions
            {
                HttpHeaders = new Azure.Storage.Blobs.Models.BlobHttpHeaders
                {
                    ContentType = contentType
                }
            };
            await client.UploadAsync(content, options, cancellationToken: default);
            return client.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload blob to {BlobPath}", blobPath);
            return null;
        }
    }
}
