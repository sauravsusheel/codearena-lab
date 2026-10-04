resource "aws_iam_role" "task" {
  name = "${var.project_name}-task"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
resource "aws_iam_role_policy" "task_s3" {
  role = aws_iam_role.task.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["s3:GetObject","s3:PutObject","s3:ListBucket","s3:DeleteObject"], Resource = [aws_s3_bucket.backups.arn, "${aws_s3_bucket.backups.arn}/*"] }] })
}
resource "aws_iam_role" "execution" {
  name = "${var.project_name}-execution"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"]
}

resource "aws_iam_role_policy" "execution_secrets" {
  role = aws_iam_role.execution.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = concat([
        aws_secretsmanager_secret.database_url.arn,
        aws_secretsmanager_secret.redis_url.arn,
        aws_secretsmanager_secret.jwt.arn,
        aws_secretsmanager_secret.worker.arn
      ], var.bootstrap_admin_password != "" ? [aws_secretsmanager_secret.bootstrap_password[0].arn] : [])
    }]
  })
}

resource "aws_lb" "public" {
  name = "${var.project_name}-alb"
  load_balancer_type = "application"
  internal = false
  security_groups = [aws_security_group.alb.id]
  subnets = aws_subnet.public[*].id
}
resource "aws_lb_target_group" "web" {
  name = "${var.project_name}-web"
  port = 80
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.main.id
  health_check { path = "/" matcher = "200-399" interval = 30 timeout = 5 healthy_threshold = 2 unhealthy_threshold = 5 }
}
resource "aws_lb_target_group" "api" {
  name = "${var.project_name}-api"
  port = 8787
  protocol = "HTTP"
  target_type = "ip"
  vpc_id = aws_vpc.main.id
  health_check {
    path = "/api/health"
    matcher = "200-399"
    interval = 30
    timeout = 5
    healthy_threshold = 2
    unhealthy_threshold = 5
  }
}
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.public.arn
  port = 80
  protocol = "HTTP"
  default_action { type = "forward" target_group_arn = aws_lb_target_group.web.arn }
}
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10
  action { type = "forward" target_group_arn = aws_lb_target_group.api.arn }
  condition { path_pattern { values = ["/api/*"] } }
}

variable "certificate_arn" { type = string default = "" }
resource "aws_lb_listener" "https" {
  count = var.certificate_arn == "" ? 0 : 1
  load_balancer_arn = aws_lb.public.arn
  port = 443
  protocol = "HTTPS"
  certificate_arn = var.certificate_arn
  ssl_policy = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  default_action { type = "forward" target_group_arn = aws_lb_target_group.web.arn }
}

resource "aws_lb_listener_rule" "api_https" {
  count        = var.certificate_arn == "" ? 0 : 1
  listener_arn = aws_lb_listener.https[0].arn
  priority     = 10
  action { type = "forward" target_group_arn = aws_lb_target_group.api.arn }
  condition { path_pattern { values = ["/api/*"] } }
}

resource "aws_secretsmanager_secret" "database_url" { name = "${var.project_name}/database-url" }
resource "aws_secretsmanager_secret" "redis_url" { name = "${var.project_name}/redis-url" }
resource "aws_secretsmanager_secret" "jwt" { name = "${var.project_name}/jwt-secret" }
resource "aws_secretsmanager_secret" "worker" { name = "${var.project_name}/worker-secret" }
resource "aws_secretsmanager_secret" "bootstrap_password" { count = var.bootstrap_admin_password == "" ? 0 : 1 name = "${var.project_name}/bootstrap-admin-password" }
resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://codearena:${urlencode(random_password.db.result)}@${aws_rds_cluster.postgres.endpoint}:5432/codearena?sslmode=require"
}
resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id = aws_secretsmanager_secret.redis_url.id
  secret_string = "rediss://:${urlencode(random_password.redis.result)}@${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379/0"
}
resource "aws_secretsmanager_secret_version" "jwt" { secret_id = aws_secretsmanager_secret.jwt.id secret_string = random_password.jwt.result }
resource "aws_secretsmanager_secret_version" "worker" { secret_id = aws_secretsmanager_secret.worker.id secret_string = random_password.worker.result }
resource "aws_secretsmanager_secret_version" "bootstrap_password" {
  count = var.bootstrap_admin_password == "" ? 0 : 1
  secret_id = aws_secretsmanager_secret.bootstrap_password[0].id
  secret_string = var.bootstrap_admin_password
}

locals {
  public_origin = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.public.dns_name}"
  bootstrap_env = var.bootstrap_admin_usn != "" && var.bootstrap_admin_password != "" ? [{
    name = "CODEARENA_BOOTSTRAP_ADMIN_USN", value = var.bootstrap_admin_usn
  }, {
    name = "CODEARENA_BOOTSTRAP_ADMIN_NAME", value = var.bootstrap_admin_name
  }] : []
  bootstrap_secrets = var.bootstrap_admin_usn != "" && var.bootstrap_admin_password != "" ? [{
    name = "CODEARENA_BOOTSTRAP_ADMIN_PASSWORD", valueFrom = aws_secretsmanager_secret.bootstrap_password[0].arn
  }] : []
}

resource "aws_ecs_task_definition" "app" {
  family = "${var.project_name}-app"
  requires_compatibilities = ["EC2"]
  network_mode = "awsvpc"
  cpu = "1024"
  memory = "2048"
  execution_role_arn = aws_iam_role.execution.arn
  task_role_arn = aws_iam_role.task.arn
  volume { name = "docker-sock" host_path = "/var/run/docker.sock" }
  container_definitions = jsonencode([
    {
      name = "codearena-api"
      image = "${aws_ecr_repository.app["codearena-app"].repository_url}:latest"
      essential = true
      command = ["node","server/index.mjs"]
      portMappings = [{ containerPort = 8787, hostPort = 8787, protocol = "tcp" }]
      mountPoints = [{ sourceVolume = "docker-sock", containerPath = "/var/run/docker.sock" }]
      environment = concat([
        { name = "NODE_ENV", value = "production" },
        { name = "CODEARENA_PRODUCTION", value = "1" },
        { name = "CODEARENA_DOCKER", value = "1" },
        { name = "CODEARENA_EXTERNAL_WORKER", value = "1" },
        { name = "CODEARENA_REDIS_REQUIRED", value = "1" },
        { name = "CODEARENA_REDIS_QUEUE_KEY", value = "codearena:submissions" },
        { name = "CODEARENA_CORS_ORIGIN", value = local.public_origin },
        { name = "CODEARENA_PORT", value = "8787" },
        { name = "CODEARENA_HOST", value = "0.0.0.0" },
        { name = "CODEARENA_RATE_LIMIT", value = "120" },
        { name = "CODEARENA_MIN_LEARNING_HOURS", value = "5" }
      ], local.bootstrap_env)
      secrets = concat([
        { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.database_url.arn },
        { name = "CODEARENA_REDIS_URL", valueFrom = aws_secretsmanager_secret.redis_url.arn },
        { name = "CODEARENA_JWT_SECRET", valueFrom = aws_secretsmanager_secret.jwt.arn },
        { name = "CODEARENA_WORKER_SECRET", valueFrom = aws_secretsmanager_secret.worker.arn }
      ], local.bootstrap_secrets)
      healthCheck = { command = ["CMD-SHELL","node -e \"fetch('http://127.0.0.1:8787/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\""], interval = 30, timeout = 10, retries = 5, startPeriod = 60 }
      logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.codearena.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "api" } }
    },
    {
      name = "codearena-web"
      image = "${aws_ecr_repository.app["codearena-web"].repository_url}:latest"
      essential = true
      dependsOn = [{ containerName = "codearena-api", condition = "HEALTHY" }]
      portMappings = [{ containerPort = 80, hostPort = 80, protocol = "tcp" }]
      environment = [{ name = "CODEARENA_API_PROXY_TARGET", value = "http://127.0.0.1:8787" }]
      logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.codearena.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "web" } }
    }
  ])
}

resource "aws_ecs_task_definition" "worker" {
  family = "${var.project_name}-worker"
  requires_compatibilities = ["EC2"]
  network_mode = "awsvpc"
  cpu = "1024"
  memory = "2048"
  execution_role_arn = aws_iam_role.execution.arn
  task_role_arn = aws_iam_role.task.arn
  volume { name = "docker-sock" host_path = "/var/run/docker.sock" }
  container_definitions = jsonencode([{
    name = "judge-worker"
    image = "${aws_ecr_repository.app["codearena-app"].repository_url}:latest"
    essential = true
    command = ["sh","-lc","node scripts/build-sandbox-images.mjs && node scripts/judge-worker.mjs"]
    mountPoints = [{ sourceVolume = "docker-sock", containerPath = "/var/run/docker.sock" }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "CODEARENA_PRODUCTION", value = "1" },
      { name = "CODEARENA_DOCKER", value = "1" },
      { name = "CODEARENA_API_URL", value = local.public_origin },
      { name = "CODEARENA_REDIS_QUEUE_KEY", value = "codearena:submissions" },
      { name = "CODEARENA_WORKER_POLL_MS", value = "250" }
    ]
    secrets = [
      { name = "CODEARENA_REDIS_URL", valueFrom = aws_secretsmanager_secret.redis_url.arn },
      { name = "CODEARENA_WORKER_SECRET", valueFrom = aws_secretsmanager_secret.worker.arn }
    ]
    logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.codearena.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "worker" } }
  }])
}

resource "aws_ecs_service" "app" {
  name = "${var.project_name}-app"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count = var.api_desired_count
  launch_type = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent = 200
  network_configuration { subnets = aws_subnet.private[*].id security_groups = [aws_security_group.ecs.id] assign_public_ip = false }
  load_balancer { target_group_arn = aws_lb_target_group.web.arn container_name = "codearena-web" container_port = 80 }
  load_balancer { target_group_arn = aws_lb_target_group.api.arn container_name = "codearena-api" container_port = 8787 }
  depends_on = [aws_lb_listener.http]
}
resource "aws_ecs_service" "worker" {
  name = "${var.project_name}-worker"
  cluster = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count = var.worker_desired_count
  launch_type = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent = 200
  network_configuration { subnets = aws_subnet.private[*].id security_groups = [aws_security_group.ecs.id] assign_public_ip = false }
}

resource "aws_ecs_task_definition" "backup" {
  family = "${var.project_name}-backup"
  requires_compatibilities = ["EC2"]
  network_mode = "awsvpc"
  cpu = "256"
  memory = "512"
  execution_role_arn = aws_iam_role.execution.arn
  task_role_arn = aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name = "backup"
    image = "${aws_ecr_repository.app["codearena-app"].repository_url}:latest"
    essential = true
    command = ["node","scripts/backup-codearena.mjs"]
    environment = [
      { name = "CODEARENA_BACKUP_S3_URI", value = "s3://${aws_s3_bucket.backups.id}/snapshots" }
    ]
    secrets = [{ name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.database_url.arn }]
    logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.codearena.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "backup" } }
  }])
}

resource "aws_iam_role" "events" {
  name = "${var.project_name}-events"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "events.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
resource "aws_iam_role_policy" "events_run_task" {
  role = aws_iam_role.events.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["ecs:RunTask"], Resource = aws_ecs_task_definition.backup.arn }, { Effect = "Allow", Action = ["iam:PassRole"], Resource = [aws_iam_role.execution.arn, aws_iam_role.task.arn] }] })
}
resource "aws_cloudwatch_event_rule" "backup" {
  name = "${var.project_name}-backup"
  schedule_expression = "rate(6 hours)"
}
resource "aws_cloudwatch_event_target" "backup" {
  rule = aws_cloudwatch_event_rule.backup.name
  arn = aws_ecs_cluster.main.arn
  role_arn = aws_iam_role.events.arn
  ecs_target {
    task_definition_arn = aws_ecs_task_definition.backup.arn
    launch_type = "EC2"
    network_configuration {
      subnets = aws_subnet.private[*].id
      security_groups = [aws_security_group.ecs.id]
      assign_public_ip = false
    }
  }
}
