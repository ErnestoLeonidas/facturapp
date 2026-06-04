$ErrorActionPreference = "Stop"

$backupDir = $env:BACKUP_DIR
if (-not $backupDir) { $backupDir = "backups" }
$composeFile = $env:COMPOSE_FILE
if (-not $composeFile) { $composeFile = "docker-compose.postgres.yml" }
$postgresService = $env:POSTGRES_SERVICE
if (-not $postgresService) { $postgresService = "postgres" }
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$out = Join-Path $backupDir "$stamp-factuflow-postgres.sql"

docker compose -f $composeFile exec -T $postgresService sh -c 'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' | Out-File -FilePath $out -Encoding utf8
if ($LASTEXITCODE -ne 0) {
  if (Test-Path $out) { Remove-Item -Force $out }
  throw "No se pudo crear el backup de PostgreSQL."
}

Write-Host "Backup creado: $out"
