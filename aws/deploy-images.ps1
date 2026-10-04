param(
  [string]$Region = ""
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$Account = aws sts get-caller-identity --query Account --output text
$AppRepo = terraform -chdir=aws/terraform output -raw ecr_app_repository
$WebRepo = terraform -chdir=aws/terraform output -raw ecr_web_repository
$ConfiguredRegion = terraform -chdir=aws/terraform output -raw aws_region
$Cluster = terraform -chdir=aws/terraform output -raw ecs_cluster_name
$AppService = terraform -chdir=aws/terraform output -raw ecs_app_service_name
$WorkerService = terraform -chdir=aws/terraform output -raw ecs_worker_service_name
if ($Region -and $Region -ne $ConfiguredRegion) { throw "Requested region $Region does not match Terraform region $ConfiguredRegion." }
$Region = $ConfiguredRegion
$Registry = "$Account.dkr.ecr.$Region.amazonaws.com"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry

docker build -f Dockerfile.codearena -t "$AppRepo`:latest" .
docker push "$AppRepo`:latest"

docker build -f Dockerfile.frontend --build-arg VITE_CODEARENA_API_URL=/api-proxy --build-arg VITE_CODEARENA_REQUIRE_AUTH=1 -t "$WebRepo`:latest" .
docker push "$WebRepo`:latest"

aws ecs update-service --cluster $Cluster --service $AppService --force-new-deployment --region $Region | Out-Null
aws ecs update-service --cluster $Cluster --service $WorkerService --force-new-deployment --region $Region | Out-Null
Write-Host "CodeArena ECS deployment triggered."
