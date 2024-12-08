# Human Tasks:
# 1. Ensure AWS credentials are properly configured for production environment
# 2. Verify VPC and subnet configurations exist and are properly tagged
# 3. Review and adjust instance sizes and counts based on production workload requirements
# 4. Configure backup retention periods and maintenance windows according to production SLAs
# 5. Validate security group configurations and access controls
# 6. Review encryption settings and KMS key configurations
# 7. Set up monitoring and alerting thresholds appropriate for production

# Terraform configuration
# Requirement: Infrastructure as Code
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # AWS Provider version: 5.0.0
      version = "~> 5.0.0"
    }
  }

  # Backend configuration for state management
  # Requirement: Production Environment Setup
  backend "s3" {
    bucket         = "terraform-state-prod"
    key            = "state/prod/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks-prod"
  }
}

# Provider configuration
# Requirement: Production Environment Setup
provider "aws" {
  region  = "us-west-2"
  profile = "prod"

  default_tags {
    tags = {
      Environment = "prod"
      ManagedBy   = "terraform"
      Project     = "workflow-automation-platform"
    }
  }
}

# EKS Cluster Module
# Requirement: Production Environment Setup
module "eks" {
  source = "../../modules/eks"

  eks_cluster_name = "prod-workflow-platform"
  aws_region       = "us-west-2"
  environment      = "prod"

  # Additional EKS-specific configurations can be added here
}

# RDS Instance Module
# Requirement: Production Environment Setup
module "rds" {
  source = "../../modules/rds"

  rds_identifier        = "prod-workflow-db"
  rds_engine           = "postgres"
  rds_instance_class   = "db.r5.2xlarge"
  rds_allocated_storage = 500
  rds_username         = "admin"
  rds_password         = var.rds_master_password  # Should be passed as a variable
  rds_db_name          = "workflow_prod"
  rds_multi_az         = true
  rds_storage_encrypted = true
  
  vpc_security_group_ids = [aws_security_group.rds_prod.id]
  subnet_ids            = data.aws_subnets.private.ids
  engine_version        = "14.6"

  tags = {
    Environment = "prod"
    Service     = "workflow-platform"
  }
}

# Redis Cluster Module
# Requirement: Production Environment Setup
module "redis" {
  source = "../../modules/redis"

  redis_cluster_id          = "prod-workflow-cache"
  redis_node_type          = "cache.r6g.xlarge"
  redis_num_cache_nodes    = 3
  redis_engine_version     = "7.0"
  redis_parameter_group_name = "prod-redis-params"
  
  environment = "prod"
  vpc_id      = data.aws_vpc.main.id
  allowed_security_group_ids = [aws_security_group.redis_prod.id]
  subnet_ids  = data.aws_subnets.private.ids
  sns_topic_arn = aws_sns_topic.redis_alerts.arn

  node_type       = "cache.r6g.xlarge"
  num_cache_nodes = 3
}

# Amazon MQ Module
# Requirement: Production Environment Setup
module "mq" {
  source = "../../modules/mq"

  broker_name        = "prod-workflow-mq"
  engine_type        = "ActiveMQ"
  engine_version     = "5.15.14"
  deployment_mode    = "ACTIVE_STANDBY_MULTI_AZ"
  host_instance_type = "mq.m5.xlarge"

  mq_users = [
    {
      username = "workflow_app"
      password = var.mq_app_password  # Should be passed as a variable
      console_access = true
      groups = ["prod-workflow"]
    }
  ]

  vpc_id                  = data.aws_vpc.main.id
  subnet_ids              = data.aws_subnets.private.ids
  allowed_security_groups = [aws_security_group.mq_prod.id]
  environment            = "prod"
  
  maintenance_day_of_week = "SUN"
  maintenance_time_of_day = "03:00"
  maintenance_time_zone   = "UTC"
  
  alarm_actions = [aws_sns_topic.mq_alerts.arn]
}

# Data sources for VPC and subnet information
data "aws_vpc" "main" {
  tags = {
    Environment = "prod"
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

# Security Groups
resource "aws_security_group" "rds_prod" {
  name        = "prod-rds-sg"
  description = "Security group for production RDS instance"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

resource "aws_security_group" "redis_prod" {
  name        = "prod-redis-sg"
  description = "Security group for production Redis cluster"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

resource "aws_security_group" "mq_prod" {
  name        = "prod-mq-sg"
  description = "Security group for production MQ broker"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    from_port       = 61617
    to_port         = 61617
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

# SNS Topics for Alerts
resource "aws_sns_topic" "redis_alerts" {
  name = "prod-redis-alerts"
}

resource "aws_sns_topic" "mq_alerts" {
  name = "prod-mq-alerts"
}

# Variables
variable "rds_master_password" {
  description = "Master password for RDS instance"
  type        = string
  sensitive   = true
}

variable "mq_app_password" {
  description = "Application password for MQ broker"
  type        = string
  sensitive   = true
}

# Outputs
output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.eks_cluster_endpoint
}

output "rds_endpoint" {
  description = "Endpoint for RDS instance"
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "Endpoint for Redis cluster"
  value       = module.redis.redis_endpoint
}

output "mq_broker_endpoint" {
  description = "Endpoint for MQ broker"
  value       = module.mq.mq_broker_endpoint
}