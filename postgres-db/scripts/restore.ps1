param(
  [Parameter(Mandatory=$true)]
  [string]$BackupFile
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  throw "No existe .env. Copia .env.example a .env o ejecuta npm run setup."
}

if (-not (Test-Path $BackupFile)) {
  throw "No existe el archivo: $BackupFile"
}

Write-Host "Restaurando $BackupFile en PostgreSQL. Presiona Ctrl+C para cancelar."
Start-Sleep -Seconds 3

Get-Content -Raw -Path $BackupFile | docker compose --env-file .env -f docker-compose.yml exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" "$POSTGRES_DB"'
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo restaurar el backup de PostgreSQL."
}

Write-Host "Restore finalizado."
