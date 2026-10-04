# CodeArena AWS integration

The project now contains an AWS deployment profile under `aws/terraform/`.

## Local vs AWS

Local development continues to use `docker-compose.codearena.yml` with PostgreSQL and Redis containers.

AWS uses:

`ALB -> ECS EC2 (web + API) -> RDS PostgreSQL / ElastiCache Redis`

and

`ECS EC2 judge-worker -> Redis queue -> CodeArena API -> Docker sandbox`

Backups are scheduled every six hours to an encrypted, versioned S3 bucket.

## Files added

- `aws/terraform/` — complete infrastructure as code.
- `.env.codearena.aws.example` — AWS environment template.
- `nginx.codearena.conf.template` — runtime-configurable API proxy.
- `AWS_CODEARENA_DEPLOYMENT.md` — deployment notes.

No AWS credentials or real secrets are stored in the repository.

## One-command deployment

From the repository root, after installing AWS CLI, Terraform and Docker and configuring an AWS identity:

### Windows PowerShell

```powershell
aws sts get-caller-identity
.\aws\deploy-all.ps1
```

### Linux/macOS/WSL

```bash
aws sts get-caller-identity
./aws/deploy-all.sh
```

The script validates Terraform, provisions the AWS infrastructure, builds both CodeArena images, pushes them to ECR, forces ECS deployments, waits for both ECS services to become stable, and prints the ALB URL.

**The script intentionally stops before `terraform apply` if AWS credentials are not configured.** No credentials or generated secrets are included in the ZIP.

## Worker/API routing

The ALB sends `/api/*` requests directly to the CodeArena API container on port 8787, while ordinary web traffic goes to the frontend container. This allows the external judge worker to call the protected internal worker endpoints while keeping the Docker sandbox authoritative on ECS EC2 capacity.
