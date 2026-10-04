param(
  [string]$Region = "",
  [switch]$SkipApply
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Tf = Join-Path $Root "aws\terraform"
Set-Location $Root

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is required. Install it and rerun this script."
  }
}

Require-Command "aws"
Require-Command "terraform"
Require-Command "docker"

$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
if (-not $identity.Account) { throw "AWS credentials are not configured. Run 'aws configure' first." }
Write-Host "AWS account: $($identity.Account) / region: $Region"
if ($Region) { $env:TF_VAR_aws_region = $Region }

if (-not $SkipApply) {
  if (-not (Test-Path (Join-Path $Tf "terraform.tfvars"))) {
    Copy-Item (Join-Path $Tf "terraform.tfvars.example") (Join-Path $Tf "terraform.tfvars")
    Write-Host "Created aws/terraform/terraform.tfvars from the example. Review it before continuing."
  }
  terraform -chdir=aws/terraform init
  terraform -chdir=aws/terraform validate
  terraform -chdir=aws/terraform plan -out=tfplan
  terraform -chdir=aws/terraform apply -auto-approve tfplan
}

$AppRepo = terraform -chdir=aws/terraform output -raw ecr_app_repository
$WebRepo = terraform -chdir=aws/terraform output -raw ecr_web_repository
$Region = terraform -chdir=aws/terraform output -raw aws_region
$Cluster = terraform -chdir=aws/terraform output -raw ecs_cluster_name
$AppService = terraform -chdir=aws/terraform output -raw ecs_app_service_name
$WorkerService = terraform -chdir=aws/terraform output -raw ecs_worker_service_name
$Registry = "$($identity.Account).dkr.ecr.$Region.amazonaws.com"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $Registry

docker build -f Dockerfile.codearena -t "$AppRepo`:latest" .
docker push "$AppRepo`:latest"

docker build -f Dockerfile.frontend --build-arg VITE_CODEARENA_API_URL=/api-proxy --build-arg VITE_CODEARENA_REQUIRE_AUTH=1 -t "$WebRepo`:latest" .
docker push "$WebRepo`:latest"

aws ecs update-service --cluster $Cluster --service $AppService --force-new-deployment --region $Region | Out-Null
aws ecs update-service --cluster $Cluster --service $WorkerService --force-new-deployment --region $Region | Out-Null

aws ecs wait services-stable --cluster $Cluster --services $AppService $WorkerService --region $Region
$Url = terraform -chdir=aws/terraform output -raw alb_url
Write-Host "CodeArena deployment is stable: $Url"
Write-Host "Health: $Url/api/health"
