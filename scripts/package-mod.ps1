$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$version = [string]$package.version
$distRoot = Join-Path $projectRoot 'dist'
$modernView = Join-Path $distRoot 'SFSE\Plugins\OSF\UI\views\console.command-center\main\manifest.json'
$legacyView = Join-Path $distRoot 'SFSE\Plugins\OSFUI\views\console.command-center'
if (-not (Test-Path -LiteralPath $modernView)) { throw 'The OSF UI 2.0 view was not built.' }
if (Test-Path -LiteralPath $legacyView) { throw 'Legacy OSF UI view files remain in dist.' }

$artifactRoot = Join-Path $projectRoot 'artifacts'
$archivePath = Join-Path $artifactRoot "Console-Command-Center-v$version-Nexus.zip"
New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
if (Test-Path -LiteralPath $archivePath) { Remove-Item -LiteralPath $archivePath -Force }

$stream = [IO.File]::Open($archivePath, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($file in Get-ChildItem -LiteralPath $distRoot -Recurse -File) {
        $relative = $file.FullName.Substring($distRoot.Length + 1).Replace('\', '/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
finally {
    $archive.Dispose()
    $stream.Dispose()
}

$hashStream = [IO.File]::OpenRead($archivePath)
try {
    $sha = [Security.Cryptography.SHA256]::Create()
    $hash = [BitConverter]::ToString($sha.ComputeHash($hashStream)).Replace('-', '')
}
finally {
    if ($sha) { $sha.Dispose() }
    $hashStream.Dispose()
}
Set-Content -LiteralPath "$archivePath.sha256" -Value "$hash  $([IO.Path]::GetFileName($archivePath))" -Encoding ascii
Get-Item -LiteralPath $archivePath | Select-Object Name, Length
Write-Output "SHA256 $hash"
