output "alb_url" { value = "http://${aws_lb.public.dns_name}" }
output "alb_dns_name" { value = aws_lb.public.dns_name }
output "aws_region" { value = var.aws_region }
output "ecs_cluster_name" { value = aws_ecs_cluster.main.name }
output "ecs_app_service_name" { value = aws_ecs_service.app.name }
output "ecs_worker_service_name" { value = aws_ecs_service.worker.name }
output "ecr_app_repository" { value = aws_ecr_repository.app["codearena-app"].repository_url }
output "ecr_web_repository" { value = aws_ecr_repository.app["codearena-web"].repository_url }
output "s3_backup_bucket" { value = aws_s3_bucket.backups.bucket }
output "rds_endpoint" { value = aws_rds_cluster.postgres.endpoint sensitive = true }
output "redis_endpoint" { value = aws_elasticache_replication_group.redis.primary_endpoint_address sensitive = true }
