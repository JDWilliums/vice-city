# Change to the project root directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = (Get-Item $scriptPath).Parent.FullName
Set-Location -Path $rootPath

# Check if sharp is installed
$sharpInstalled = npm list sharp 2>$null
if (-not $sharpInstalled) {
    Write-Host "Installing sharp..."
    npm install --save sharp
}

# Check if unprocessed-images directory exists
$unprocessedDir = Join-Path -Path $rootPath -ChildPath "public\unprocessed-images"
if (-not (Test-Path -Path $unprocessedDir)) {
    Write-Host "Creating unprocessed-images directory..."
    New-Item -Path $unprocessedDir -ItemType Directory -Force
    Write-Host "Please place your images in the unprocessed-images folder, then run this script again."
    Exit
}

# Check if there are any images to process
$imageCount = (Get-ChildItem -Path $unprocessedDir -File | Where-Object {$_.Extension -match '\.(jpg|jpeg|png|webp)$'}).Count
if ($imageCount -eq 0) {
    Write-Host "No images found in $unprocessedDir"
    Write-Host "Please place your images in the unprocessed-images folder, then run this script again."
    Exit
}

# Run the generation script
Write-Host "Starting image generation for $imageCount images..."
npm run generate-images

Write-Host "Done!" 