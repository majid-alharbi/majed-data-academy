# One-time publish: creates the public GitHub repo (if missing), pushes main,
# enables GitHub Pages with the Actions workflow, and prints the site URL.
# Requires: GitHub CLI (gh) logged in with `gh auth login`.
$ErrorActionPreference = 'Stop'
$repo = 'majed-data-academy'
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'GitHub CLI (gh) is not installed. Run: winget install --id GitHub.cli' }
gh auth status | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Not logged in. Run: gh auth login' }

$owner = gh api user --jq .login
Write-Host "GitHub user: $owner"

gh repo view "$owner/$repo" *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Repository $owner/$repo already exists; not creating a duplicate."
  if (-not (git remote 2>$null | Select-String -SimpleMatch 'origin')) { git remote add origin "https://github.com/$owner/$repo.git" }
} else {
  gh repo create "$owner/$repo" --public --description 'منصة تعليمية عربية لمقرر إدارة بيانات الأعمال' --source . --remote origin
}

git push -u origin main

# Enable Pages with GitHub Actions as the source (ignore "already enabled").
gh api -X POST "repos/$owner/$repo/pages" -f build_type=workflow *> $null
gh api -X PUT "repos/$owner/$repo/pages" -f build_type=workflow *> $null

Write-Host ''
Write-Host "Repository: https://github.com/$owner/$repo"
Write-Host "Site (after the Actions run finishes): https://$owner.github.io/$repo/"
Write-Host "Watch the deploy: gh run watch --repo $owner/$repo"
