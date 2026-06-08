<#
.SYNOPSIS
  Safe import of a new landing version into malea_landing_deploy.

.DESCRIPTION
  Copies ONLY the production file set (index.html, linked CSS, JS entry + modules,
  fonts) from a source folder into malea_landing_deploy.
  Does NOT copy the whole folder. Does NOT touch main. Does NOT publish production.

.PARAMETER SourcePath
  Required. Path to the folder with the new landing version.

.PARAMETER CommitAndPush
  Optional switch. If set, runs safe-save.ps1 (commit + push to dev) after import.

.EXAMPLE
  .\scripts\import-version.ps1 -SourcePath "C:\Users\svoro\Downloads\Бэкап-2\desktop-refinement-lab-1"

.EXAMPLE
  .\scripts\import-version.ps1 -SourcePath "C:\path\to\new-version" -CommitAndPush
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$SourcePath,

  [Parameter(Mandatory = $false)]
  [switch]$CommitAndPush
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------
# 1. Constants and paths
# ---------------------------------------------------------------
$DeployDir  = "C:\Users\svoro\Downloads\Бэкап-2\malea_landing_deploy"
$BackupRoot = "C:\Users\svoro\Downloads\Бэкап-2\malea_landing_backups"
$ExpectedRemote = "https://github.com/malea-music/malea-landing.git"

# ---------------------------------------------------------------
# 2. Helper functions
# ---------------------------------------------------------------

function Write-Step($Message) {
  Write-Host ""
  Write-Host ">>> $Message" -ForegroundColor Cyan
}

function Write-Ok($Message) {
  Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Warn($Message) {
  Write-Host "  [WARN] $Message" -ForegroundColor Yellow
}

function Write-Error($Message) {
  Write-Host "  [ERROR] $Message" -ForegroundColor Red
}

function Stop-WithError($Message) {
  Write-Error $Message
  exit 1
}

function Test-GitBranch {
  $branch = (git branch --show-current).Trim()
  if ($branch -ne "dev") {
    Stop-WithError "Current branch is '$branch'. Import allowed only from dev. Run: git checkout dev"
  }
  Write-Ok "Branch: $branch"
}

function Test-GitRemote {
  $remote = (git remote get-url origin).Trim()
  if ($remote -ne $ExpectedRemote) {
    Stop-WithError "Remote origin mismatch. Expected: $ExpectedRemote. Actual: $remote"
  }
  Write-Ok "Remote: $remote"
}

function Test-GitStatus {
  $status = git status --porcelain
  if ($status) {
    Write-Warn "Uncommitted changes detected:"
    git status
    $answer = Read-Host "Continue with these changes? (y/N)"
    if ($answer -ne "y" -and $answer -ne "Y") {
      Stop-WithError "Aborted by user. Commit changes manually before import."
    }
  } else {
    Write-Ok "Working tree clean"
  }
}

function Get-RelativePath {
  param([string]$Base, [string]$Target)
  # Manual implementation of GetRelativePath for .NET Framework (PowerShell 5.1)
  $baseUri = New-Object Uri -ArgumentList ($Base.TrimEnd('\') + '\')
  $targetUri = New-Object Uri -ArgumentList $Target
  $relativeUri = $baseUri.MakeRelativeUri($targetUri)
  return [System.Uri]::UnescapeDataString($relativeUri.ToString()).Replace('/', '\')
}

function Get-ProductionWhitelist {
  param([string]$SourceIndexPath)

  $whitelist = [System.Collections.ArrayList]::new()
  $sourceRoot = [System.IO.Path]::GetDirectoryName($SourceIndexPath)

  # index.html always included
  [void]$whitelist.Add("index.html")

  # Read index.html
  $html = Get-Content $SourceIndexPath -Raw -Encoding UTF8

  # CSS from <link rel="stylesheet" href="...">
  $cssPattern = '<link[^>]+rel=["'']stylesheet["''][^>]+href=["'']([^"'']+)["'']'
  $cssMatches = [regex]::Matches($html, $cssPattern)
  foreach ($match in $cssMatches) {
    $href = $match.Groups[1].Value
    # Strip query string (?v=4)
    $cleanPath = $href -replace '\?.*$', ''
    [void]$whitelist.Add($cleanPath)
  }

  # JS entry from <script type="module" src="...">
  $jsEntryPattern = '<script[^>]+type=["'']module["''][^>]+src=["'']([^"'']+)["'']'
  $jsEntryMatches = [regex]::Matches($html, $jsEntryPattern)
  foreach ($match in $jsEntryMatches) {
    $src = $match.Groups[1].Value
    $cleanPath = $src -replace '\?.*$', ''
    [void]$whitelist.Add($cleanPath)

    # Parse JS module imports from entry file
    $jsFullPath = [System.IO.Path]::Combine($sourceRoot, $cleanPath)
    if (Test-Path $jsFullPath) {
      $jsContent = Get-Content $jsFullPath -Raw -Encoding UTF8
      $importPattern = "import\s+.*?\s+from\s+['""]([^'""]+)['""]"
      $importMatches = [regex]::Matches($jsContent, $importPattern)
      foreach ($importMatch in $importMatches) {
        $importPath = $importMatch.Groups[1].Value
        # Only relative imports (./ or ../)
        if ($importPath -like "./*" -or $importPath -like "../*") {
          $resolvedPath = [System.IO.Path]::GetFullPath(
            [System.IO.Path]::Combine(
              [System.IO.Path]::GetDirectoryName($jsFullPath), $importPath
            )
          )
          $relPath = Get-RelativePath -Base $sourceRoot -Target $resolvedPath
          $relPath = $relPath -replace '\\', '/'
          if (-not $whitelist.Contains($relPath)) {
            [void]$whitelist.Add($relPath)
          }
        }
      }
    }
  }

  # Fonts from assets/fonts/
  $sourceFontsDir = [System.IO.Path]::Combine($sourceRoot, "assets", "fonts")
  if (Test-Path $sourceFontsDir) {
    $fontFiles = Get-ChildItem $sourceFontsDir -File
    foreach ($font in $fontFiles) {
      $relPath = "assets/fonts/$($font.Name)"
      if (-not $whitelist.Contains($relPath)) {
        [void]$whitelist.Add($relPath)
      }
    }
  }

  return $whitelist
}

function Test-Excluded($FilePath) {
  $excluded = @(
    '\.bak', '\.bak-', 'backup', '\bold\b', 'old[.-]', '\bcopy\b',
    'draft', 'experiment', 'screenshots', 'test-results',
    'playwright-report', 'preview-check', '\btmp\b', '\btemp\b',
    '\.tmp$', 'node_modules', '\.cache'
  )
  foreach ($pattern in $excluded) {
    if ($FilePath -match $pattern) {
      return $true
    }
  }
  return $false
}

function New-Backup {
  param([string[]]$Files)

  $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
  $backupDir = [System.IO.Path]::Combine($BackupRoot, $timestamp)

  Write-Step "Creating backup in: $backupDir"

  New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

  $copiedCount = 0
  foreach ($file in $Files) {
    $sourceFile = [System.IO.Path]::Combine($DeployDir, $file)
    if (Test-Path $sourceFile) {
      $destDir = [System.IO.Path]::Combine($backupDir, [System.IO.Path]::GetDirectoryName($file))
      if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
      }
      Copy-Item -Path $sourceFile -Destination (Join-Path $backupDir $file) -Force
      $copiedCount++
    }
  }

  Write-Ok "Backup created: $copiedCount files in $backupDir"
  return $backupDir
}

# ---------------------------------------------------------------
# 3. Pre-flight checks
# ---------------------------------------------------------------

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  MALEA Landing - Import Version"              -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "Source: $SourcePath"

# 3.1 Directory check
Write-Step "Checking directory"
$currentDir = (Get-Location).Path
if ($currentDir -ne $DeployDir) {
  Write-Warn "Current directory: $currentDir"
  Write-Warn "Expected directory: $DeployDir"
  $answer = Read-Host "Change directory to $DeployDir? (Y/n)"
  if ($answer -eq "" -or $answer -eq "y" -or $answer -eq "Y") {
    Set-Location $DeployDir
    Write-Ok "Directory changed to: $DeployDir"
  } else {
    Stop-WithError "Script must be run from $DeployDir"
  }
} else {
  Write-Ok "Directory: $DeployDir"
}

# 3.2 Branch check
Write-Step "Checking Git branch"
Test-GitBranch

# 3.3 Remote check
Write-Step "Checking Git remote"
Test-GitRemote

# 3.4 Status check
Write-Step "Checking Git status"
Test-GitStatus

# 3.5 SourcePath check
Write-Step "Checking SourcePath"
if (-not (Test-Path $SourcePath)) {
  Stop-WithError "SourcePath does not exist: $SourcePath"
}
Write-Ok "SourcePath exists: $SourcePath"

# 3.6 index.html check
$sourceIndex = [System.IO.Path]::Combine($SourcePath, "index.html")
if (-not (Test-Path $sourceIndex)) {
  Stop-WithError "index.html not found in SourcePath: $sourceIndex. Folder is not a landing version."
}
Write-Ok "index.html found"

# ---------------------------------------------------------------
# 4. Determine production whitelist
# ---------------------------------------------------------------

Write-Step "Determining production whitelist"
$whitelist = Get-ProductionWhitelist -SourceIndexPath $sourceIndex

$filteredWhitelist = [System.Collections.ArrayList]::new()
foreach ($item in $whitelist) {
  if (Test-Excluded $item) {
    Write-Warn "Excluded (draft/backup): $item"
  } else {
    [void]$filteredWhitelist.Add($item)
  }
}

Write-Ok "Whitelist determined: $($filteredWhitelist.Count) files"
foreach ($item in $filteredWhitelist) {
  Write-Host "    - $item"
}

# ---------------------------------------------------------------
# 5. Check file presence in SourcePath
# ---------------------------------------------------------------

Write-Step "Checking file presence in SourcePath"
$sourceFilesToCopy = [System.Collections.ArrayList]::new()
$missingFiles = [System.Collections.ArrayList]::new()

foreach ($item in $filteredWhitelist) {
  $srcFile = [System.IO.Path]::Combine($SourcePath, $item)
  if (Test-Path $srcFile) {
    [void]$sourceFilesToCopy.Add($item)
  } else {
    [void]$missingFiles.Add($item)
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Warn "Files not found in SourcePath (will be skipped):"
  foreach ($m in $missingFiles) {
    Write-Host "    - $m"
  }
}

Write-Ok "Will copy: $($sourceFilesToCopy.Count) files"

# ---------------------------------------------------------------
# 6. Diff analysis
# ---------------------------------------------------------------

Write-Step "Analyzing changes"

$toAdd = [System.Collections.ArrayList]::new()
$toUpdate = [System.Collections.ArrayList]::new()
$toRemove = [System.Collections.ArrayList]::new()

foreach ($item in $sourceFilesToCopy) {
  $deployFile = [System.IO.Path]::Combine($DeployDir, $item)
  if (Test-Path $deployFile) {
    [void]$toUpdate.Add($item)
  } else {
    [void]$toAdd.Add($item)
  }
}

# Protected service directories
$protectedDirs = @('.git', '.roo', 'scripts', 'docs', 'plans', 'qa', 'rebuild_1', '.github', 'fonts')

# Find files in deploy that are NOT in whitelist (excluding protected dirs)
$allDeployFiles = Get-ChildItem $DeployDir -Recurse -File | Where-Object {
  $relPath = Get-RelativePath -Base $DeployDir -Target $_.FullName
  $exclude = $false
  foreach ($pd in $protectedDirs) {
    if ($relPath -like "$pd/*" -or $relPath -eq $pd) {
      $exclude = $true
      break
    }
  }
  -not $exclude
}

foreach ($df in $allDeployFiles) {
  $relPath = $df.FullName.Substring($DeployDir.Length + 1) -replace '\\', '/'
  if ($relPath -notin $sourceFilesToCopy -and $relPath -notin $filteredWhitelist) {
    [void]$toRemove.Add($relPath)
  }
}

# Summary table
Write-Host ""
Write-Host "  === Summary ===" -ForegroundColor Yellow
Write-Host "  New: $($toAdd.Count) file(s)" -ForegroundColor Yellow
if ($toAdd.Count -gt 0) {
  foreach ($a in $toAdd) { Write-Host "    + $a" -ForegroundColor Green }
}
Write-Host "  Updated: $($toUpdate.Count) file(s)" -ForegroundColor Yellow
if ($toUpdate.Count -gt 0) {
  foreach ($u in $toUpdate) { Write-Host "    ~ $u" -ForegroundColor Cyan }
}
Write-Host "  Removed from deploy: $($toRemove.Count) file(s)" -ForegroundColor Yellow
if ($toRemove.Count -gt 0) {
  foreach ($r in $toRemove) { Write-Host "    - $r" -ForegroundColor Red }
}
Write-Host "  =================" -ForegroundColor Yellow

# ---------------------------------------------------------------
# 7. User confirmation
# ---------------------------------------------------------------

Write-Step "Confirmation"
$confirm = Read-Host "Apply changes? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
  Stop-WithError "Operation cancelled by user."
}

# ---------------------------------------------------------------
# 8. Backup
# ---------------------------------------------------------------

$backupDir = New-Backup -Files $sourceFilesToCopy

# ---------------------------------------------------------------
# 9. Copy files
# ---------------------------------------------------------------

Write-Step "Copying files"

foreach ($item in $sourceFilesToCopy) {
  $srcFile = [System.IO.Path]::Combine($SourcePath, $item)
  $dstFile = [System.IO.Path]::Combine($DeployDir, $item)

  $dstDir = [System.IO.Path]::GetDirectoryName($dstFile)
  if (-not (Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
  }

  Copy-Item -Path $srcFile -Destination $dstFile -Force
  Write-Host "  + $item" -ForegroundColor Green
}

Write-Ok "Copy complete: $($sourceFilesToCopy.Count) files"

# ---------------------------------------------------------------
# 10. Final report
# ---------------------------------------------------------------

Write-Step "Final report"

Write-Host ""
Write-Host "Git diff --stat:" -ForegroundColor Cyan
git diff --stat

Write-Host ""
Write-Host "Git status:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "Backup:" -ForegroundColor Cyan
Write-Host "  $backupDir"

# ---------------------------------------------------------------
# 11. Optional: CommitAndPush
# ---------------------------------------------------------------

if ($CommitAndPush) {
  Write-Step "Commit and Push"
  Write-Host "Running safe-save.ps1..." -ForegroundColor Cyan
  $safeSaveScript = [System.IO.Path]::Combine($DeployDir, "scripts", "safe-save.ps1")
  if (Test-Path $safeSaveScript) {
    & $safeSaveScript -Message "Import new version from $SourcePath"
    Write-Ok "Changes committed and pushed to origin/dev"
  } else {
    Write-Error "safe-save.ps1 not found at: $safeSaveScript"
  }
} else {
  Write-Step "Commit skipped"
  Write-Host "Changes NOT committed. To commit, run:" -ForegroundColor Yellow
  Write-Host "  .\scripts\safe-save.ps1 -Message ""Import new version""" -ForegroundColor Yellow
  Write-Host "Or re-run with -CommitAndPush flag" -ForegroundColor Yellow
}

# ---------------------------------------------------------------
# 12. Final safety checks
# ---------------------------------------------------------------

Write-Step "Final checks"
$currentBranch = (git branch --show-current).Trim()
Write-Ok "Current branch: $currentBranch"
Write-Ok "Production NOT affected"
Write-Ok "main NOT touched"
Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Import complete"                            -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta



