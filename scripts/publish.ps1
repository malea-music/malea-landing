param(
  [string]$Confirm = ""
)

$ErrorActionPreference = "Stop"

if ($Confirm -ne "PUBLISH") {
  Write-Host "Production publish is protected."
  Write-Host "To publish dev to production, run:"
  Write-Host ".\scripts\publish.ps1 PUBLISH"
  exit 1
}

$currentBranch = (git branch --show-current).Trim()

if ($currentBranch -ne "dev") {
  Write-Host "ERROR: You must publish from dev."
  Write-Host "Run: git checkout dev"
  exit 1
}

$changes = git status --porcelain

if ($changes) {
  Write-Host "ERROR: There are uncommitted changes in dev."
  Write-Host "Run safe-save first."
  exit 1
}

git fetch origin

git checkout main
git pull origin main

git merge --no-ff dev -m "Publish dev to production"
git push origin main

git checkout dev
git pull origin dev

Write-Host ""
Write-Host "Published to production."
Write-Host "Vercel will update events.malea-soundhealing.com."
