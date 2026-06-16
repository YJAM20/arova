using LoveUniverse.Api.DTOs.Backup;

namespace LoveUniverse.Api.Services;

public interface IBackupService
{
    Task<ContentServiceResult<BackupExportResponse>> ExportAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<string>> ImportAsync(BackupImportRequest request, CancellationToken cancellationToken = default);
}
