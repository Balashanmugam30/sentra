param(
  [Parameter(Mandatory = $true)][string]$BackupPath,
  [string]$ComposeFile = "docker-compose.yml",
  [string]$Database = $env:DB_NAME,
  [string]$User = $env:DB_USER
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $BackupPath)) { throw "Backup file not found: $BackupPath" }
if (-not $Database) { $Database = "sentra" }
if (-not $User) { $User = "sentra" }

Get-Content $BackupPath | docker compose -f $ComposeFile exec -T postgres psql -U $User -d $Database
Write-Host "Restore completed from: $BackupPath"
