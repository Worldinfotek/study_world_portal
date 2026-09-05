$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env.local'
if (-not (Test-Path $envFile)) { throw 'Missing .env.local' }

Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $name, $value = $_.Split('=', 2)
  $name = $name.Trim()
  $value = $value.Trim()
  if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
    $value = $value.Substring(1, $value.Length - 2)
  }
  Set-Item -Path "Env:$name" -Value $value
}

$server = ($env:SQL_HOST -replace ':0$', '')
$database = $env:SQL_DB_NAME
$user = $env:SQL_USER
if (-not $env:SQL_PASSWORD) { throw 'Set SQL_PASSWORD in .env.local, then run this script again.' }

$env:SQLCMDPASSWORD = $env:SQL_PASSWORD
$schema = Join-Path $PSScriptRoot 'schema.sql'
$seed = Join-Path $PSScriptRoot 'seed-localdb-users.sql'

Write-Host "Applying schema on $server / $database"
sqlcmd -S $server -U $user -d $database -C -b -i $schema
if ($LASTEXITCODE -ne 0) { throw "Schema failed with exit $LASTEXITCODE" }

Write-Host 'Seeding users'
sqlcmd -S $server -U $user -d $database -C -b -i $seed
if ($LASTEXITCODE -ne 0) { throw "User seed failed with exit $LASTEXITCODE" }

Write-Host 'Schema and user seed complete.'
