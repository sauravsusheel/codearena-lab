# CodeArena AWS deployment

This directory provides Terraform infrastructure for the CodeArena Lab Station module.

## Architecture

- **ECS on EC2**: CodeArena API + web container and the Docker-based judge worker.
- **Amazon RDS Aurora PostgreSQL 16**: production relational database.
- **Amazon ElastiCache Redis**: submission queue/worker coordination.
- **Amazon ECR**: application and web images.
- **Amazon S3**: encrypted, versioned backup storage.
- **CloudWatch Logs**: API, web, worker and backup logs.
- **Application Load Balancer**: public HTTP entry point.
- **Secrets Manager**: database URL, Redis URL, JWT and worker secrets.
- **VPC**: public ECS/ALB subnets and private database/Redis subnets.

### Why ECS on EC2

CodeArena's authoritative judge uses the Docker daemon to launch isolated language sandboxes. Fargate does not provide the Docker socket required by this implementation, so the judge and API are scheduled on ECS EC2 capacity.

## Prerequisites

Install:

- AWS CLI and configure credentials (`aws configure`)
- Terraform >= 1.6
- Docker
- Git

Never commit `terraform.tfvars` containing real secrets.

## 1. Provision AWS

For a complete automated deployment from the repository root, use `aws/deploy-all.ps1` on Windows or `aws/deploy-all.sh` on Linux/macOS/WSL. The script runs the Terraform validation/apply, builds and pushes ECR images, redeploys ECS services, and waits for service stability. The manual steps below are provided for troubleshooting and controlled deployments.

```powershell
cd aws/terraform
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Terraform creates the network, RDS, Redis, ECR, ECS cluster/instances, load balancer, Secrets Manager values, S3 backup bucket and scheduled backup task.

## 2. Build and push images

After Terraform completes, get the ECR repository URL:

```powershell
terraform output -raw ecr_app_repository
terraform output -raw ecr_web_repository
```

Authenticate Docker:

```powershell
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ACCOUNT>.dkr.ecr.ap-south-1.amazonaws.com
```

From the repository root:

```powershell
docker build -f Dockerfile.codearena -t <APP_ECR_URL>:latest .
docker push <APP_ECR_URL>:latest

docker build -f Dockerfile.frontend --build-arg VITE_CODEARENA_API_URL=/api-proxy --build-arg VITE_CODEARENA_REQUIRE_AUTH=1 -t <WEB_ECR_URL>:latest .
docker push <WEB_ECR_URL>:latest
```

Then force a new ECS deployment:

```powershell
aws ecs update-service --cluster codearena-cluster --service codearena-app --force-new-deployment --region ap-south-1
aws ecs update-service --cluster codearena-cluster --service codearena-worker --force-new-deployment --region ap-south-1
```

The worker startup prepares the custom TypeScript sandbox image and pulls the language runtime images through the EC2 Docker daemon.

## 3. Verify

Open the Terraform `alb_url` output. Verify:

- Login/LMS SSO
- PostgreSQL persistence
- Redis queue
- code submission -> judge worker -> result
- hidden test results are not exposed
- station monitoring/heartbeat
- gradebook and eligibility
- CloudWatch logs
- S3 backup objects every six hours

## 4. Production HTTPS

For HTTPS, supply an ACM certificate ARN and domain name in `terraform.tfvars`. Point the domain DNS record to the ALB DNS name, then apply again.

## Important security note

The API and judge worker require access to `/var/run/docker.sock` because this implementation launches Docker sandboxes. Treat the ECS EC2 instances as a dedicated trusted execution tier. Do not SSH into them for routine operations, do not expose Docker port 2375, and keep the ECS security group restricted.

Terraform generates secrets, but Terraform state contains sensitive infrastructure values. Store the Terraform state in a secured remote backend before a team deployment and restrict access to the state.
