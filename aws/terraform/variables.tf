variable "aws_region" { type = string default = "ap-south-1" }
variable "project_name" { type = string default = "codearena" }
variable "vpc_cidr" { type = string default = "10.42.0.0/16" }
variable "instance_type" { type = string default = "t3.large" }
variable "desired_ec2_capacity" { type = number default = 1 }
variable "min_ec2_capacity" { type = number default = 1 }
variable "max_ec2_capacity" { type = number default = 3 }
variable "api_desired_count" { type = number default = 1 }
variable "worker_desired_count" { type = number default = 1 }
variable "domain_name" { type = string default = "" }
variable "bootstrap_admin_usn" { type = string default = "" sensitive = true }
variable "bootstrap_admin_name" { type = string default = "CodeArena Administrator" }
variable "bootstrap_admin_password" { type = string default = "" sensitive = true }
