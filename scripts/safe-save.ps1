param(
  [string]$Message = "Safe checkpoint"
)

$ErrorActionPreference = "Stop"

$currentBranch = (git branch --show-current).Trim()

if ($currentBranch -ne "dev") {
  Write-Host "ERROR: You are on branch '$currentBranch'. Safe-save is allowed only from dev."
  Write-Host "Run: git checkout dev"
  exit 1
}

git status

$changes = git status --porcelain

if (-not $changes) {
  Write-Host "No changes to commit."
  exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

git add .
git commit -m "$Message - $timestamp"
git push origin dev

Write-Host ""
Write-Host "Saved safely to dev."
Write-Host "Vercel preview will be updated."
Write-Host "Production was NOT updated."
