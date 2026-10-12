param(
  [ValidateSet('Setup', 'Start', 'Stop', 'Status')]
  [string]$Action = 'Status'
)

$ErrorActionPreference = 'Stop'
$alumniRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$alumniLocal = Join-Path $alumniRoot '.local'
$alumniPostgres = Join-Path $alumniLocal 'postgres'
$alumniBin = Join-Path $alumniPostgres 'pgsql\bin'
$alumniData = Join-Path $alumniLocal 'pgdata'
$alumniPort = 55432
$alumniUser = 'alumni_local'
$alumniDatabase = 'connect_alumni'
$alumniConfigPath = Join-Path $alumniLocal 'postgres-credentials.json'
$alumniPassFile = Join-Path $alumniLocal 'pgpass.conf'
$alumniEnvPath = Join-Path $alumniRoot '.env'

# All runtime files stay in this project; no Windows service is installed.
foreach ($alumniPath in @($alumniLocal, $alumniPostgres, $alumniData)) {
  $alumniResolved = [System.IO.Path]::GetFullPath($alumniPath)
  if (-not $alumniResolved.StartsWith($alumniRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Local database path is outside the project.'
  }
}

if ($Action -eq 'Status') {
  if (-not (Test-Path -LiteralPath (Join-Path $alumniBin 'pg_ctl.exe'))) {
    Write-Output 'Local PostgreSQL has not been set up. Run npm run db:local:setup.'
    exit 1
  }
  & (Join-Path $alumniBin 'pg_ctl.exe') status -D $alumniData
  exit $LASTEXITCODE
}

if ($Action -eq 'Stop') {
  if (-not (Test-Path -LiteralPath (Join-Path $alumniData 'PG_VERSION'))) {
    throw 'Local PostgreSQL has not been initialized.'
  }
  & (Join-Path $alumniBin 'pg_ctl.exe') stop -D $alumniData -m fast -w
  exit $LASTEXITCODE
}

New-Item -ItemType Directory -Path $alumniLocal -Force | Out-Null

if ($Action -eq 'Setup' -and -not (Test-Path -LiteralPath (Join-Path $alumniBin 'initdb.exe'))) {
  $alumniArchive = Join-Path $alumniLocal 'postgresql-windows.zip'
  # Windows x64 archive linked by EDB's official PostgreSQL binaries page.
  $alumniDownload = 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1260616'
  Write-Output 'Downloading portable PostgreSQL 17.11 from EDB...'
  & curl.exe --fail --location --silent --show-error --output $alumniArchive $alumniDownload
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL download failed.' }

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $alumniZip = [System.IO.Compression.ZipFile]::OpenRead($alumniArchive)
  try {
    foreach ($alumniEntry in $alumniZip.Entries) {
      $alumniTarget = [System.IO.Path]::GetFullPath((Join-Path $alumniPostgres $alumniEntry.FullName))
      if (-not $alumniTarget.StartsWith($alumniPostgres + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Invalid PostgreSQL archive path.'
      }
    }
  } finally {
    $alumniZip.Dispose()
  }
  Write-Output 'Extracting PostgreSQL into .local/postgres...'
  Expand-Archive -LiteralPath $alumniArchive -DestinationPath $alumniPostgres -Force
}

if (-not (Test-Path -LiteralPath (Join-Path $alumniBin 'pg_ctl.exe'))) {
  throw 'Run npm run db:local:setup before starting PostgreSQL.'
}

if (-not (Test-Path -LiteralPath $alumniConfigPath)) {
  if ($Action -ne 'Setup') { throw 'Local database credentials are missing. Run setup.' }
  $alumniPasswordBytes = New-Object byte[] 24
  $alumniRandom = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $alumniRandom.GetBytes($alumniPasswordBytes) } finally { $alumniRandom.Dispose() }
  $alumniPassword = ([System.BitConverter]::ToString($alumniPasswordBytes)).Replace('-', '').ToLowerInvariant()
  @{ password = $alumniPassword } | ConvertTo-Json | Set-Content -LiteralPath $alumniConfigPath -Encoding ASCII
}
$alumniConfig = Get-Content -LiteralPath $alumniConfigPath -Raw | ConvertFrom-Json

if (-not (Test-Path -LiteralPath (Join-Path $alumniData 'PG_VERSION'))) {
  if ($Action -ne 'Setup') { throw 'Local PostgreSQL has not been initialized. Run setup.' }
  $alumniInitPassword = Join-Path $alumniLocal 'initdb-password.tmp'
  [System.IO.File]::WriteAllText($alumniInitPassword, $alumniConfig.password, [System.Text.Encoding]::ASCII)
  try {
    & (Join-Path $alumniBin 'initdb.exe') -D $alumniData -U $alumniUser -A scram-sha-256 --encoding=UTF8 --locale=C "--pwfile=$alumniInitPassword"
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
  } finally {
    Remove-Item -LiteralPath $alumniInitPassword -Force -ErrorAction SilentlyContinue
  }
}

& (Join-Path $alumniBin 'pg_ctl.exe') status -D $alumniData *> $null
if ($LASTEXITCODE -ne 0) {
  $alumniStart = Start-Process -FilePath (Join-Path $alumniBin 'pg_ctl.exe') -ArgumentList @(
    'start', '-D', ('"{0}"' -f $alumniData), '-l', ('"{0}"' -f (Join-Path $alumniLocal 'postgres.log')),
    '-o', ('"-h 127.0.0.1 -p {0}"' -f $alumniPort), '-w', '-t', '30'
  ) -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $alumniLocal 'postgres-start.log') -RedirectStandardError (Join-Path $alumniLocal 'postgres-start-error.log')
  if ($alumniStart.ExitCode -ne 0) {
    Get-Content -LiteralPath (Join-Path $alumniLocal 'postgres-start-error.log')
    throw 'Could not start local PostgreSQL. See .local/postgres.log.'
  }
}

$alumniPreviousPassFile = $env:PGPASSFILE
[System.IO.File]::WriteAllText($alumniPassFile, "127.0.0.1:${alumniPort}:*:${alumniUser}:$($alumniConfig.password)", [System.Text.Encoding]::ASCII)
try {
  $env:PGPASSFILE = $alumniPassFile
  $alumniExists = & (Join-Path $alumniBin 'psql.exe') -h 127.0.0.1 -p $alumniPort -U $alumniUser -d postgres -w -tAc "SELECT 1 FROM pg_database WHERE datname = 'connect_alumni'"
  if ($LASTEXITCODE -ne 0) { throw 'Local database connection failed.' }
  if ($alumniExists -ne '1') {
    & (Join-Path $alumniBin 'createdb.exe') -h 127.0.0.1 -p $alumniPort -U $alumniUser -w $alumniDatabase
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the local application database.' }
  }
} finally {
  $env:PGPASSFILE = $alumniPreviousPassFile
  Remove-Item -LiteralPath $alumniPassFile -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path -LiteralPath $alumniEnvPath)) {
  $alumniSecretBytes = New-Object byte[] 32
  $alumniRandom = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $alumniRandom.GetBytes($alumniSecretBytes) } finally { $alumniRandom.Dispose() }
  $alumniSecret = [Convert]::ToBase64String($alumniSecretBytes)
  $alumniEnv = @(
    "DATABASE_URL=postgresql://${alumniUser}:$($alumniConfig.password)@127.0.0.1:${alumniPort}/${alumniDatabase}",
    "BETTER_AUTH_SECRET=$alumniSecret",
    'BETTER_AUTH_URL=http://localhost:3000',
    'REDIS_URL=',
    'AWS_ENDPOINT_URL_S3=',
    'AWS_ACCESS_KEY_ID=',
    'AWS_SECRET_ACCESS_KEY=',
    'AWS_REGION=us-east-2',
    'S3_BUCKET_NAME=connect-alumni'
  ) -join [Environment]::NewLine
  [System.IO.File]::WriteAllText($alumniEnvPath, $alumniEnv + [Environment]::NewLine, (New-Object System.Text.UTF8Encoding $false))
  Write-Output 'Created .env with generated local database and authentication secrets.'
} else {
  Write-Output 'Existing .env preserved.'
}
Write-Output "PostgreSQL is running at 127.0.0.1:${alumniPort}."
Write-Output 'Next: npm run db:migrate, npm run db:seed, then npm run check:runtime.'
