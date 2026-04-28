param(
  [ValidateSet("up", "down", "logs", "restart", "status", "build", "pull", "reset-volumes")]
  [string]$Command = "up"
)

$ErrorActionPreference = "Stop"

function Invoke-Compose {
  param([string[]]$Args)
  docker compose @Args
}

switch ($Command) {
  "up" {
    Invoke-Compose @("up", "--build")
  }
  "down" {
    Invoke-Compose @("down")
  }
  "logs" {
    Invoke-Compose @("logs", "-f")
  }
  "restart" {
    Invoke-Compose @("restart")
  }
  "status" {
    Invoke-Compose @("ps")
  }
  "build" {
    Invoke-Compose @("build", "--no-cache")
  }
  "pull" {
    Invoke-Compose @("pull")
  }
  "reset-volumes" {
    Invoke-Compose @("down", "-v")
  }
}
