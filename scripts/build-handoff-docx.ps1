param(
  [string]$MarkdownPath,
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot

function Get-LatestHandoffMarkdownPath {
  param([string]$RootPath)

  $latestHandoff = Get-ChildItem -LiteralPath $RootPath -Filter 'PROJECT_HANDOFF_*.md' -File |
    Sort-Object Name -Descending |
    Select-Object -First 1

  if ($null -eq $latestHandoff) {
    throw "No PROJECT_HANDOFF_*.md file was found in $RootPath"
  }

  return $latestHandoff.FullName
}

if ([string]::IsNullOrWhiteSpace($MarkdownPath)) {
  $MarkdownPath = Get-LatestHandoffMarkdownPath -RootPath $projectRoot
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = [System.IO.Path]::ChangeExtension($MarkdownPath, '.docx')
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Escape-XmlText {
  param([string]$Value)

  $escaped = [System.Security.SecurityElement]::Escape($Value)

  if ($null -eq $escaped) {
    return ''
  }

  return $escaped
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [int]$FontSize,
    [bool]$Bold = $false
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return '<w:p/>'
  }

  $escapedText = Escape-XmlText $Text
  $boldXml = ''

  if ($Bold) {
    $boldXml = '<w:b/>'
  }

  return "<w:p><w:r><w:rPr>$boldXml<w:sz w:val=`"$FontSize`"/><w:szCs w:val=`"$FontSize`"/></w:rPr><w:t xml:space=`"preserve`">$escapedText</w:t></w:r></w:p>"
}

function Add-ZipEntryFromString {
  param(
    [System.IO.Compression.ZipArchive]$Archive,
    [string]$EntryName,
    [string]$Value
  )

  $entry = $Archive.CreateEntry($EntryName)
  $stream = $entry.Open()
  $encoding = New-Object System.Text.UTF8Encoding($false)
  $writer = New-Object System.IO.StreamWriter($stream, $encoding)

  try {
    $writer.Write($Value)
  }
  finally {
    $writer.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $MarkdownPath)) {
  throw "Markdown file not found: $MarkdownPath"
}

$markdown = Get-Content -LiteralPath $MarkdownPath -Raw
$lines = $markdown -replace "`r`n", "`n" -split "`n"
$paragraphs = New-Object System.Collections.Generic.List[string]
$documentTitle = $null

foreach ($line in $lines) {
  if ($line -match '^# (.+)$') {
    if ([string]::IsNullOrWhiteSpace($documentTitle)) {
      $documentTitle = $Matches[1]
    }

    $paragraphs.Add((New-ParagraphXml -Text $Matches[1] -FontSize 40 -Bold $true))
    continue
  }

  if ($line -match '^## (.+)$') {
    $paragraphs.Add((New-ParagraphXml -Text $Matches[1] -FontSize 32 -Bold $true))
    continue
  }

  if ($line -match '^### (.+)$') {
    $paragraphs.Add((New-ParagraphXml -Text $Matches[1] -FontSize 28 -Bold $true))
    continue
  }

  $paragraphs.Add((New-ParagraphXml -Text $line -FontSize 22))
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.openxmlformats.org/officeDocument/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    $($paragraphs -join '')
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$timestamp = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")

if ([string]::IsNullOrWhiteSpace($documentTitle)) {
  $documentTitle = [System.IO.Path]::GetFileNameWithoutExtension($OutputPath)
}

$contentTypesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$relsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>$(Escape-XmlText $documentTitle)</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$timestamp</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$timestamp</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>
"@

if (Test-Path -LiteralPath $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
  Add-ZipEntryFromString -Archive $archive -EntryName '[Content_Types].xml' -Value $contentTypesXml
  Add-ZipEntryFromString -Archive $archive -EntryName '_rels/.rels' -Value $relsXml
  Add-ZipEntryFromString -Archive $archive -EntryName 'docProps/core.xml' -Value $coreXml
  Add-ZipEntryFromString -Archive $archive -EntryName 'docProps/app.xml' -Value $appXml
  Add-ZipEntryFromString -Archive $archive -EntryName 'word/document.xml' -Value $documentXml
}
finally {
  $archive.Dispose()
}

Write-Host "Updated $OutputPath from $MarkdownPath"
