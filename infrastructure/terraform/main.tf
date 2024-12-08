# List of tasks that require human attention:
# 1. Review and validate AWS credentials and permissions
# 2. Ensure VPC and networking prerequisites are configured
# 3. Verify resource naming conventions match organization standards
# 4. Review security group configurations and access controls
# 5. Validate instance types and sizes for each environment
# 6. Confirm backup and maintenance window configurations
# 7. Review encryption settings and key management policies

# AWS Provider version: 5.0.0
# Terraform version: >= 1.5.0

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Main configuration file for core infrastructure components

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Local variables for resource naming and tagging
locals {
  name_prefix = "${var.environment}-workflow-platform"
  
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "workflow-automation-platform"
  }
}

# EKS Cluster Module
# Requirement: Scalable and Reliable Infrastructure
module "eks" {
  source = "./modules/eks"

  eks_cluster_name = var.eks_cluster_name
  aws_region      = var.aws_region
  environment     = var.environment
}

# RDS Instance Module
# Requirement: Scalable and Reliable Infrastructure
module "rds" {
  source = "./modules/rds"

  identifier          = "${local.name_prefix}-db"
  engine             = "postgres"
  instance_class     = var.rds_instance_type
  allocated_storage  = 100
  
  # Security configuration
  vpc_security_group_ids = [aws_security_group.rds.id]
  subnet_ids            = data.aws_subnets.private.ids
  
  # Database configuration
  db_name  = "workflow_db"
  username = "admin"
  password = random_password.rds_password.result

  # High availability configuration
  multi_az = true
  
  tags = local.common_tags
}

# Redis Cluster Module
# Requirement: Scalable and Reliable Infrastructure
module "redis" {
  source = "./modules/redis"

  cluster_id       = "${local.name_prefix}-cache"
  node_type        = "cache.t3.medium"
  num_cache_nodes  = var.redis_node_count
  
  # Network configuration
  vpc_id               = data.aws_vpc.main.id
  subnet_ids           = data.aws_subnets.private.ids
  allowed_security_groups = [module.eks.node_security_group_id]
  
  environment = var.environment
  
  # Monitoring configuration
  sns_topic_arn = aws_sns_topic.alerts.arn
}

# Amazon MQ Module
# Requirement: Scalable and Reliable Infrastructure
module "mq" {
  source = "./modules/mq"

  broker_name     = "${local.name_prefix}-mq"
  engine_type     = "ActiveMQ"
  engine_version  = "5.15.14"
  deployment_mode = "ACTIVE_STANDBY_MULTI_AZ"
  
  host_instance_type = var.mq_instance_size
  
  # Network configuration
  vpc_id              = data.aws_vpc.main.id
  subnet_ids          = data.aws_subnets.private.ids
  allowed_security_groups = [module.eks.node_security_group_id]
  
  environment = var.environment
  
  # User configuration
  mq_users = [
    {
      username = "app"
      password = random_password.mq_password.result
      groups   = ["app-group"]
    }
  ]
  
  # Maintenance configuration
  maintenance_day_of_week = "Sunday"
  maintenance_time_of_day = "03:00"
  maintenance_time_zone   = "UTC"
  
  alarm_actions = [aws_sns_topic.alerts.arn]
}

# Random password generation for RDS
resource "random_password" "rds_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Random password generation for MQ
resource "random_password" "mq_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# SNS Topic for monitoring alerts
resource "aws_sns_topic" "alerts" {
  name = "${local.name_prefix}-alerts"
  
  tags = local.common_tags
}

# Security group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${local.name_prefix}-rds-"
  vpc_id      = data.aws_vpc.main.id
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "PostgreSQL access from EKS"
  }
  
  tags = local.common_tags
}

# Data sources for network configuration
data "aws_vpc" "main" {
  tags = {
    Environment = var.environment
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  
  tags = {
    Type = "private"
  }
}

# SSM Parameters for sensitive values
resource "aws_ssm_parameter" "rds_password" {
  name        = "/${local.name_prefix}/rds/password"
  description = "RDS master password"
  type        = "SecureString"
  value       = random_password.rds_password.result
  
  tags = local.common_tags
}

resource "aws_ssm_parameter" "mq_password" {
  name        = "/${local.name_prefix}/mq/password"
  description = "MQ application user password"
  type        = "SecureString"
  value       = random_password.mq_password.result
  
  tags = local.common_tags
}