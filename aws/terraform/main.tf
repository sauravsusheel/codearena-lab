data "aws_availability_zones" "available" { state = "available" }
data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/recommended/image_id"
}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support = true
}
resource "aws_internet_gateway" "igw" { vpc_id = aws_vpc.main.id }

resource "aws_subnet" "public" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}
resource "aws_subnet" "private" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
  availability_zone = data.aws_availability_zones.available.names[count.index]
}
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0" gateway_id = aws_internet_gateway.igw.id }
}
resource "aws_route_table_association" "public" {
  count = 2
  subnet_id = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private subnet egress for RDS/ElastiCache maintenance and future private workloads.
resource "aws_eip" "nat" { domain = "vpc" }
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id = aws_subnet.public[0].id
  depends_on = [aws_internet_gateway.igw]
}
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0" nat_gateway_id = aws_nat_gateway.nat.id }
}
resource "aws_route_table_association" "private" {
  count = 2
  subnet_id = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

resource "aws_security_group" "alb" {
  name = "${var.project_name}-alb"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 80 to_port = 80 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 443 to_port = 443 protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}
resource "aws_security_group" "ecs" {
  name = "${var.project_name}-ecs"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 80 to_port = 80 protocol = "tcp" security_groups = [aws_security_group.alb.id] }
  ingress { from_port = 8787 to_port = 8787 protocol = "tcp" security_groups = [aws_security_group.alb.id] }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}
resource "aws_security_group" "data" {
  name = "${var.project_name}-data"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 5432 to_port = 5432 protocol = "tcp" security_groups = [aws_security_group.ecs.id] }
  ingress { from_port = 6379 to_port = 6379 protocol = "tcp" security_groups = [aws_security_group.ecs.id] }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "random_password" "db" { length = 32 special = true override_special = "_%@" }
resource "random_password" "redis" { length = 32 special = true override_special = "_%-" }
resource "random_password" "jwt" { length = 64 special = false }
resource "random_password" "worker" { length = 48 special = false }

resource "aws_db_subnet_group" "postgres" {
  name = "${var.project_name}-postgres"
  subnet_ids = aws_subnet.private[*].id
}
resource "aws_rds_cluster_parameter_group" "postgres" {
  name = "${var.project_name}-postgres-params"
  family = "aurora-postgresql16"
  parameter { name = "rds.force_ssl" value = "1" }
}
# Aurora PostgreSQL is used here for managed HA; the application remains PostgreSQL-compatible.
resource "aws_rds_cluster" "postgres" {
  cluster_identifier = "${var.project_name}-postgres"
  engine = "aurora-postgresql"
  engine_version = "16.6"
  database_name = "codearena"
  master_username = "codearena"
  master_password = random_password.db.result
  db_subnet_group_name = aws_db_subnet_group.postgres.name
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.postgres.name
  vpc_security_group_ids = [aws_security_group.data.id]
  backup_retention_period = 7
  storage_encrypted = true
  skip_final_snapshot = true
}
resource "aws_rds_cluster_instance" "postgres" {
  count = 1
  identifier = "${var.project_name}-postgres-${count.index}"
  cluster_identifier = aws_rds_cluster.postgres.id
  instance_class = "db.t4g.medium"
  engine = aws_rds_cluster.postgres.engine
  engine_version = aws_rds_cluster.postgres.engine_version
  publicly_accessible = false
}

resource "aws_elasticache_subnet_group" "redis" {
  name = "${var.project_name}-redis"
  subnet_ids = aws_subnet.private[*].id
}
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-redis"
  description = "CodeArena queue and coordination"
  engine = "redis"
  node_type = "cache.t4g.micro"
  num_cache_clusters = 1
  port = 6379
  auth_token = random_password.redis.result
  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.data.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

resource "aws_s3_bucket" "backups" {
  bucket = "${var.project_name}-${data.aws_caller_identity.current.account_id}-backups"
  force_destroy = false
}
data "aws_caller_identity" "current" {}
resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_policy" "backups" {
  bucket = aws_s3_bucket.backups.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid = "DenyInsecureTransport"
      Effect = "Deny"
      Principal = "*"
      Action = "s3:*"
      Resource = [aws_s3_bucket.backups.arn, "${aws_s3_bucket.backups.arn}/*"]
      Condition = { Bool = { "aws:SecureTransport" = "false" } }
    }]
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  rule {
    id = "retain-90-days"
    status = "Enabled"
    filter {}
    expiration { days = 90 }
  }
}

resource "aws_iam_role" "ecs_instance" {
  name = "${var.project_name}-ecs-instance"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }] })
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role", "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"]
}
resource "aws_iam_role_policy" "ecs_s3" {
  role = aws_iam_role.ecs_instance.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["s3:GetObject","s3:PutObject","s3:ListBucket","s3:DeleteObject"], Resource = [aws_s3_bucket.backups.arn, "${aws_s3_bucket.backups.arn}/*"] }] })
}
resource "aws_iam_instance_profile" "ecs" { name = "${var.project_name}-ecs-instance" role = aws_iam_role.ecs_instance.name }

resource "aws_launch_template" "ecs" {
  name_prefix = "${var.project_name}-ecs-"
  image_id = data.aws_ssm_parameter.ecs_ami.value
  instance_type = var.instance_type
  iam_instance_profile { name = aws_iam_instance_profile.ecs.name }
  vpc_security_group_ids = [aws_security_group.ecs.id]
  user_data = base64encode(<<-USERDATA
    #!/bin/bash
    echo ECS_CLUSTER=${aws_ecs_cluster.main.name} >> /etc/ecs/ecs.config
    echo ECS_ENABLE_TASK_IAM_ROLE=true >> /etc/ecs/ecs.config
    echo ECS_ENABLE_CONTAINER_METADATA=true >> /etc/ecs/ecs.config
  USERDATA
  )
  metadata_options { http_endpoint = "enabled" http_tokens = "required" }
}
resource "aws_autoscaling_group" "ecs" {
  name = "${var.project_name}-ecs-asg"
  min_size = var.min_ec2_capacity
  max_size = var.max_ec2_capacity
  desired_capacity = var.desired_ec2_capacity
  vpc_zone_identifier = aws_subnet.public[*].id
  launch_template { id = aws_launch_template.ecs.id version = "$Latest" }
  health_check_type = "EC2"
}
resource "aws_ecs_cluster" "main" { name = "${var.project_name}-cluster" }

resource "aws_cloudwatch_log_group" "codearena" {
  name = "/ecs/${var.project_name}"
  retention_in_days = 30
}
