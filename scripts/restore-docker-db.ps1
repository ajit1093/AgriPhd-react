<#
.SYNOPSIS
  Restores the 2025_AgriPHD_Live_20260817.bak into the Docker SQL Server container.
#>

param(
    [string]$ContainerName = "agriphd-sqlserver",
    [string]$SaPassword = "AgriPhdDevPass2026!",
    [string]$BakPath = "/var/opt/mssql/backup/2025_AgriPHD_Live_20260817.bak",
    [string]$DbName = "2025_AgriPHD_Live"
)

Write-Host "Checking if container '$ContainerName' is running..." -ForegroundColor Cyan
$isRunning = docker inspect -f '{{.State.Running}}' $ContainerName 2>$null
if ($isRunning -ne "true") {
    Write-Host "Container '$ContainerName' is not running. Starting with docker compose up -d..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 10
}

Write-Host "Waiting for SQL Server to be ready to accept connections..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    $check = docker exec $ContainerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SaPassword -C -Q "SELECT 1" 2>$null
    if ($LASTEXITCODE -eq 0 -and $check -match "1") {
        $ready = $true
        Write-Host "SQL Server is ready!" -ForegroundColor Green
        break
    }
    Write-Host "Waiting for SQL Server ($attempt/$maxAttempts)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

if (-not $ready) {
    Write-Error "SQL Server did not become ready in time."
    exit 1
}

Write-Host "Querying logical file names inside backup..." -ForegroundColor Cyan
$filelistQuery = "RESTORE FILELISTONLY FROM DISK = '$BakPath'"
$filelist = docker exec $ContainerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SaPassword -C -Q $filelistQuery -y 0

Write-Host $filelist

# Execute restore command with MOVE
$restoreSql = @"
RESTORE DATABASE [$DbName]
FROM DISK = '$BakPath'
WITH MOVE (SELECT LogicalName FROM (VALUES (1)) AS t(x)) ...
"@

Write-Host "Running RESTORE DATABASE..." -ForegroundColor Cyan
$restoreCommand = @"
DECLARE @dataLogical NVARCHAR(128);
DECLARE @logLogical NVARCHAR(128);

CREATE TABLE #FileList (
    LogicalName NVARCHAR(128),
    PhysicalName NVARCHAR(260),
    Type CHAR(1),
    FileGroupName NVARCHAR(128),
    Size NUMERIC(20,0),
    MaxSize NUMERIC(20,0),
    FileID BIGINT,
    CreateLSN NUMERIC(25,0),
    DropLSN NUMERIC(25,0),
    UniqueID UNIQUEIDENTIFIER,
    ReadOnlyLSN NUMERIC(25,0),
    ReadWriteLSN NUMERIC(25,0),
    BackupSizeInBytes BIGINT,
    SourceBlockSize INT,
    FileGroupID INT,
    LogGroupGUID UNIQUEIDENTIFIER,
    DifferentialBaseLSN NUMERIC(25,0),
    DifferentialBaseGUID UNIQUEIDENTIFIER,
    IsReadOnly BIT,
    IsPresent BIT,
    TDEThumbprint VARBINARY(32),
    SnapshotUrl NVARCHAR(360)
);

INSERT INTO #FileList
EXEC('RESTORE FILELISTONLY FROM DISK = ''$BakPath''');

SELECT TOP 1 @dataLogical = LogicalName FROM #FileList WHERE Type = 'D';
SELECT TOP 1 @logLogical = LogicalName FROM #FileList WHERE Type = 'L';

DECLARE @sql NVARCHAR(MAX);
SET @sql = 'RESTORE DATABASE [$DbName] FROM DISK = ''$BakPath'' WITH ' +
           'MOVE ''' + @dataLogical + ''' TO ''/var/opt/mssql/data/$DbName.mdf'', ' +
           'MOVE ''' + @logLogical + ''' TO ''/var/opt/mssql/data/${DbName}_log.ldf'', ' +
           'REPLACE, STATS = 10;';

EXEC sp_executesql @sql;
DROP TABLE #FileList;
"@

docker exec -i $ContainerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $SaPassword -C -Q $restoreCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database '$DbName' restored successfully!" -ForegroundColor Green
} else {
    Write-Error "Failed to restore database."
}

