#!/usr/bin/env bash
set -euo pipefail
REGION="${AWS_REGION:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
APP_REPO="$(terraform -chdir=aws/terraform output -raw ecr_app_repository)"
WEB_REPO="$(terraform -chdir=aws/terraform output -raw ecr_web_repository)"
CONFIGURED_REGION="$(terraform -chdir=aws/terraform output -raw aws_region)"
CLUSTER="$(terraform -chdir=aws/terraform output -raw ecs_cluster_name)"
APP_SERVICE="$(terraform -chdir=aws/terraform output -raw ecs_app_service_name)"
WORKER_SERVICE="$(terraform -chdir=aws/terraform output -raw ecs_worker_service_name)"
if [[ -n "$REGION" && "$REGION" != "$CONFIGURED_REGION" ]]; then
	echo "Requested region $REGION does not match Terraform region $CONFIGURED_REGION." >&2
	exit 1
fi
REGION="$CONFIGURED_REGION"
ACCOUNT="$(aws sts get-caller-identity --query Account --output text)"
REGISTRY="${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker build -f Dockerfile.codearena -t "${APP_REPO}:latest" .
docker push "${APP_REPO}:latest"
docker build -f Dockerfile.frontend --build-arg VITE_CODEARENA_API_URL=/api-proxy --build-arg VITE_CODEARENA_REQUIRE_AUTH=1 -t "${WEB_REPO}:latest" .
docker push "${WEB_REPO}:latest"
aws ecs update-service --cluster "$CLUSTER" --service "$APP_SERVICE" --force-new-deployment --region "$REGION" >/dev/null
aws ecs update-service --cluster "$CLUSTER" --service "$WORKER_SERVICE" --force-new-deployment --region "$REGION" >/dev/null
echo "CodeArena ECS deployment triggered."
