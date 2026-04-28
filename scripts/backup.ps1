param(
  [string]$ComposeFile = "docker-compose.yml",
  [string]$OutputDir = "backups",
  [string]$Database = $env:DB_NAME,
  [string]$User = $env:DB_USER,
  [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"
if (-not $Database) { $Database = "sentra" }
if (-not $User) { $User = "sentra" }

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDir "sentra-$timestamp.sql"

docker compose -f $ComposeFile exec -T postgres pg_dump -U $User -d $Database | Out-File -FilePath $backupPath -Encoding utf8

$cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem $OutputDir -Filter "sentra-*.sql" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force

Write-Host "Backup created: $backupPath"
