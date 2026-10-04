$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$version = [string]$package.version
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "package.json contains an invalid release version: $version"
}

$artifactRoot = Join-Path $projectRoot 'artifacts'
$sourceZip = Join-Path $artifactRoot "console-command-center-v$version-source.zip"
$manifestPath = Join-Path $artifactRoot "PACKAGE_MANIFEST_v$version.txt"
$sourceRootName = "console-command-center-v$version"

New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null

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

$sourceFiles = @(Get-SourceFiles $projectRoot)
if (Test-Path -LiteralPath $sourceZip) {
    Remove-Item -LiteralPath $sourceZip -Force
}

$sourceStream = [IO.File]::Open($sourceZip, [IO.FileMode]::CreateNew)
$archive = [IO.Compression.ZipArchive]::new($sourceStream, [IO.Compression.ZipArchiveMode]::Create, $false)
try {
    foreach ($file in $sourceFiles) {
        $relative = $file.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
        $entryName = "$sourceRootName/$relative"
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
finally {
    $archive.Dispose()
    $sourceStream.Dispose()
}

$hashStream = [IO.File]::OpenRead($sourceZip)
try {
    $sha = [Security.Cryptography.SHA256]::Create()
    $sourceHash = [BitConverter]::ToString($sha.ComputeHash($hashStream)).Replace('-', '')
}
finally {
    if ($sha) { $sha.Dispose() }
    $hashStream.Dispose()
}
$manifest = @(
    "Console Command Center v$version"
    ''
    'Full source ZIP:'
    "  console-command-center-v$version-source.zip  SHA256 $sourceHash"
    ''
    "Included source files: $($sourceFiles.Count)"
    ''
    'Extract the project, then run npm install and npm run build.'
)
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

Get-Item -LiteralPath $sourceZip, $manifestPath | Select-Object Name, Length
