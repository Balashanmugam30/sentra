param(
  [string]$BaseUrl = "http://localhost",
  [string]$ApiBaseUrl = "$BaseUrl/api"
)

$ErrorActionPreference = "Stop"

function Assert-Ok([string]$Url) {
  $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 20
  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
    throw "Smoke check failed for $Url with $($response.StatusCode)"
  }
  Write-Host "OK $Url"
}

Assert-Ok "$BaseUrl/"
Assert-Ok "$ApiBaseUrl/health"
Assert-Ok "$ApiBaseUrl/system/health/deep"
Assert-Ok "$ApiBaseUrl/system/metrics"
Write-Host "Sentra smoke tests passed."
