param(
  [Parameter(Mandatory=$true)]
  [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
  throw "No existe el archivo: $BackupFile"
}

$composeFile = $env:COMPOSE_FILE
if (-not $composeFile) { $composeFile = "docker-compose.postgres.yml" }
$postgresService = $env:POSTGRES_SERVICE
if (-not $postgresService) { $postgresService = "postgres" }

Write-Host "Restaurando $BackupFile en PostgreSQL. Presiona Ctrl+C para cancelar."
Start-Sleep -Seconds 3

Get-Content -Raw -Path $BackupFile | docker compose -f $composeFile exec -T $postgresService sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" "$POSTGRES_DB"'
if ($LASTEXITCODE -ne 0) {
  throw "No se pudo restaurar el backup de PostgreSQL."
}

Write-Host "Restore finalizado."
