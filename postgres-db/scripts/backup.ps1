$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  throw "No existe .env. Copia .env.example a .env o ejecuta npm run setup."
}

New-Item -ItemType Directory -Force -Path "backups" | Out-Null
$stamp = Get-Date -Format "yyyyMMddHHmmss"
$out = Join-Path "backups" "$stamp-factuflow-postgres.sql"

docker compose --env-file .env -f docker-compose.yml exec -T postgres sh -c 'pg_dump --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" "$POSTGRES_DB"' | Out-File -FilePath $out -Encoding utf8
if ($LASTEXITCODE -ne 0) {
  if (Test-Path $out) { Remove-Item -Force $out }
  throw "No se pudo crear el backup de PostgreSQL."
}

Write-Host "Backup creado: $out"
