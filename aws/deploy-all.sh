#!/usr/bin/env bash
set -euo pipefail
REGION="${AWS_REGION:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
command -v aws >/dev/null || { echo "AWS CLI is required."; exit 1; }
command -v terraform >/dev/null || { echo "Terraform is required."; exit 1; }
command -v docker >/dev/null || { echo "Docker is required."; exit 1; }
aws sts get-caller-identity >/dev/null || { echo "Configure AWS credentials first."; exit 1; }
if [[ -n "$REGION" ]]; then export TF_VAR_aws_region="$REGION"; fi
if [[ ! -f aws/terraform/terraform.tfvars ]]; then cp aws/terraform/terraform.tfvars.example aws/terraform/terraform.tfvars; echo "Review aws/terraform/terraform.tfvars before continuing."; exit 1; fi
terraform -chdir=aws/terraform init
terraform -chdir=aws/terraform validate
terraform -chdir=aws/terraform plan -out=tfplan
terraform -chdir=aws/terraform apply -auto-approve tfplan
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
APP_REPO="$(terraform -chdir=aws/terraform output -raw ecr_app_repository)"
WEB_REPO="$(terraform -chdir=aws/terraform output -raw ecr_web_repository)"
REGION="$(terraform -chdir=aws/terraform output -raw aws_region)"
CLUSTER="$(terraform -chdir=aws/terraform output -raw ecs_cluster_name)"
APP_SERVICE="$(terraform -chdir=aws/terraform output -raw ecs_app_service_name)"
WORKER_SERVICE="$(terraform -chdir=aws/terraform output -raw ecs_worker_service_name)"
REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker build -f Dockerfile.codearena -t "${APP_REPO}:latest" .
docker push "${APP_REPO}:latest"
docker build -f Dockerfile.frontend --build-arg VITE_CODEARENA_API_URL=/api-proxy --build-arg VITE_CODEARENA_REQUIRE_AUTH=1 -t "${WEB_REPO}:latest" .
docker push "${WEB_REPO}:latest"
aws ecs update-service --cluster "$CLUSTER" --service "$APP_SERVICE" --force-new-deployment --region "$REGION" >/dev/null
aws ecs update-service --cluster "$CLUSTER" --service "$WORKER_SERVICE" --force-new-deployment --region "$REGION" >/dev/null
aws ecs wait services-stable --cluster "$CLUSTER" --services "$APP_SERVICE" "$WORKER_SERVICE" --region "$REGION"
echo "CodeArena deployment is stable: $(terraform -chdir=aws/terraform output -raw alb_url)"
