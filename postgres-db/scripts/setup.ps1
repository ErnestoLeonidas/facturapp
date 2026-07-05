$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Creado .env desde .env.example. Revisa POSTGRES_PASSWORD si es ambiente real."
}

if (-not (Test-Path "node_modules")) {
  npm install
}

docker compose --env-file .env -f docker-compose.yml up -d
npm run migrate
npm run seed

Write-Host "PostgreSQL listo."
