param(
    [string]$PreviousVersion
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$version = [string]$package.version
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "package.json contains an invalid release version: $version"
}

$artifactRoot = Join-Path $projectRoot 'artifacts'
$patchStage = Join-Path $artifactRoot ".stage-v$version-source-patch"
$previousStage = Join-Path $artifactRoot ".stage-v$version-previous-source"
$patchZip = Join-Path $artifactRoot "console-command-center-v$version-patch.zip"
$sourceZip = Join-Path $artifactRoot "console-command-center-v$version-source.zip"
$manifestPath = Join-Path $artifactRoot "PACKAGE_MANIFEST_v$version.txt"
$sourceRootName = "console-command-center-v$version"

New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
$resolvedArtifacts = (Resolve-Path $artifactRoot).Path

function Remove-SafeStage([string]$path) {
    if (-not (Test-Path -LiteralPath $path)) { return }
    $resolved = (Resolve-Path -LiteralPath $path).Path
    if (-not $resolved.StartsWith($resolvedArtifacts + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove staging path outside artifacts: $resolved"
    }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}

function Get-SourceFiles([string]$root) {
    $excludedTopLevel = @('.git', '.xmake', '.osfui', 'artifacts', 'build', 'dist', 'mod', 'native/lib', 'node_modules', 'release')
    $excludedNames = @('.id-records.json', '.id-records-shattered-space.json', '.id-records-base.err', '.id-records-ss.err')
    Get-ChildItem -LiteralPath $root -Recurse -File | Where-Object {
        $relative = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
        if ($excludedNames -contains $_.Name) { return $false }
        foreach ($prefix in $excludedTopLevel) {
            if ($relative -eq $prefix -or $relative.StartsWith($prefix + '/', [StringComparison]::OrdinalIgnoreCase)) { return $false }
        }
        return -not ($relative.EndsWith('.zip', [StringComparison]::OrdinalIgnoreCase) -or
            $relative.EndsWith('.log', [StringComparison]::OrdinalIgnoreCase) -or
            $relative.EndsWith('.err', [StringComparison]::OrdinalIgnoreCase))
    }
}

Remove-SafeStage $patchStage
Remove-SafeStage $previousStage
New-Item -ItemType Directory -Path $patchStage | Out-Null

$currentFiles = @(Get-SourceFiles $projectRoot)
$currentByPath = @{}
foreach ($file in $currentFiles) {
    $relative = $file.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
    $currentByPath[$relative] = $file
}

$previousByPath = @{}
if ($PreviousVersion) {
    $previousZip = Join-Path $artifactRoot "console-command-center-v$PreviousVersion-source.zip"
    if (-not (Test-Path -LiteralPath $previousZip)) {
        throw "Previous source archive not found: $previousZip"
    }
    New-Item -ItemType Directory -Path $previousStage | Out-Null
    [IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path $previousZip).Path, $previousStage)
    $previousRoot = Get-ChildItem -LiteralPath $previousStage -Directory | Select-Object -First 1
    if (-not $previousRoot) { throw "Previous source archive has no project root folder." }
    foreach ($file in Get-SourceFiles $previousRoot.FullName) {
        $relative = $file.FullName.Substring($previousRoot.FullName.Length + 1).Replace('\', '/')
        $previousByPath[$relative] = $file
    }
}

$changedPaths = [Collections.Generic.List[string]]::new()
foreach ($relative in $currentByPath.Keys) {
    $currentFile = $currentByPath[$relative]
    $previousFile = $previousByPath[$relative]
    $changed = -not $previousFile
    if (-not $changed) {
        $changed = (Get-FileHash -Algorithm SHA256 -LiteralPath $currentFile.FullName).Hash -ne
            (Get-FileHash -Algorithm SHA256 -LiteralPath $previousFile.FullName).Hash
    }
    if ($changed) {
        $destination = Join-Path $patchStage $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
        Copy-Item -LiteralPath $currentFile.FullName -Destination $destination -Force
        $changedPaths.Add($relative)
    }
}

$deletedPaths = @($previousByPath.Keys | Where-Object { -not $currentByPath.ContainsKey($_) } | Sort-Object)
$patchInstructions = @(
    "Console Command Center v$version source patch"
    ''
    'Extract this ZIP directly over the root of your existing console-command-center project and allow overwrites.'
    'Then run either:'
    '  npm run build'
    '  npm run dev:game'
    ''
    'This is project source, not a mod-manager installation archive.'
)
if ($deletedPaths.Count -gt 0) {
    $patchInstructions += ''
    $patchInstructions += 'Delete these obsolete project files after extracting:'
    $patchInstructions += $deletedPaths | ForEach-Object { "  $_" }
}
Set-Content -LiteralPath (Join-Path $patchStage 'PATCH_README.txt') -Value $patchInstructions -Encoding UTF8

foreach ($zipPath in @($patchZip, $sourceZip)) {
    if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
}
[IO.Compression.ZipFile]::CreateFromDirectory($patchStage, $patchZip, [IO.Compression.CompressionLevel]::Optimal, $false)

$sourceStream = [IO.File]::Open($sourceZip, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($sourceStream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($file in $currentFiles) {
        $relative = $file.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
        $entryName = "$sourceRootName/$relative"
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
finally {
    $archive.Dispose()
    $sourceStream.Dispose()
}

$patchHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $patchZip).Hash
$sourceHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $sourceZip).Hash
$manifest = @(
    "Console Command Center v$version"
    ''
    'Source patch ZIP (extract over an existing project, then build):'
    "  console-command-center-v$version-patch.zip  SHA256 $patchHash"
    ''
    'Full source ZIP:'
    "  console-command-center-v$version-source.zip  SHA256 $sourceHash"
    ''
    "Changed or added source files: $($changedPaths.Count)"
)
$manifest += $changedPaths | Sort-Object | ForEach-Object { "  $_" }
if ($deletedPaths.Count -gt 0) {
    $manifest += ''
    $manifest += 'Obsolete files to delete:'
    $manifest += $deletedPaths | ForEach-Object { "  $_" }
}
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

Remove-SafeStage $patchStage
Remove-SafeStage $previousStage

Get-Item -LiteralPath $patchZip, $sourceZip, $manifestPath | Select-Object Name, Length
