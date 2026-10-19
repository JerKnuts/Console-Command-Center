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
    # Explicit maintained roots prevent local experiments and generated trees
    # from silently entering the published source archive.
    $rootFiles = @('.gitignore', 'CHANGELOG.md', 'COMMAND_CATALOG.md', 'EXCEPTIONS', 'LICENSE',
        'README.md', 'RELEASE_VALIDATION.md', 'THIRD_PARTY_NOTICES.md', 'osfui.config.ts',
        'osfui.mock.ts', 'package.json', 'package-lock.json', 'tsconfig.json', 'xmake.lua')
    foreach ($name in $rootFiles) {
        $path = Join-Path $root $name
        if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Required source file missing: $name" }
        Get-Item -LiteralPath $path
    }
    function Get-MaintainedFiles([string]$directory) {
        foreach ($item in Get-ChildItem -LiteralPath $directory) {
            if ($item.PSIsContainer) {
                if ($item.Name -in @('lib', 'node_modules', '.git', '.xmake', '.osfui', '__pycache__')) { continue }
                Get-MaintainedFiles $item.FullName
            } elseif ($item.Name -notmatch '(?i)\.(zip|log|err|pyc|obj|pdb|dll|exe)$' -and
                $item.Name -notin @('Thumbs.db', 'Desktop.ini', '.DS_Store')) {
                $item
            }
        }
    }
    foreach ($name in @('src', 'native', 'scripts', 'tests', 'docs', 'batches')) {
        Get-MaintainedFiles (Join-Path $root $name)
    }
}

$sourceFiles = @(Get-SourceFiles $projectRoot | Sort-Object FullName)
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
    'Extract the project, then run npm ci and npm run build. See docs/DEVELOPMENT.md.'
)
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

Get-Item -LiteralPath $sourceZip, $manifestPath | Select-Object Name, Length
