# Human Tasks:
# 1. Ensure AWS credentials are properly configured
# 2. Verify VPC and subnet configurations exist
# 3. Review and adjust resource configurations for development environment
# 4. Validate IAM permissions for resource creation
# 5. Configure appropriate security groups
# 6. Set up monitoring and alerting thresholds

# Terraform configuration
# Requirement: Development Environment Provisioning
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # v5.0.0
      version = "~> 5.0.0"
    }
  }
}

# Import provider configuration
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = "workflow-automation-platform"
    }
  }
}

# Local variables for resource naming and tagging
locals {
  name_prefix = "workflow-${var.environment}"
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "workflow-automation-platform"
  }
}

# EKS Cluster Module
# Requirement: Development Environment Provisioning
module "eks" {
  source = "../../modules/eks"

  eks_cluster_name = "${local.name_prefix}-eks"
  aws_region      = var.aws_region
  environment     = var.environment

  # Additional EKS-specific configurations can be added here
}

# RDS Instance Module
# Requirement: Development Environment Provisioning
module "rds" {
  source = "../../modules/rds"

  rds_identifier        = "${local.name_prefix}-db"
  rds_engine           = "postgres"
  rds_instance_class   = var.rds_instance_type
  rds_allocated_storage = 20
  rds_username         = "dbadmin"
  rds_password         = "CHANGE_ME_BEFORE_APPLY"  # Should be changed and managed securely
  rds_db_name          = "workflow_db"
  rds_multi_az         = false  # Set to false for dev environment
  rds_storage_encrypted = true
  
  vpc_security_group_ids = ["sg-CHANGE_ME"]  # Update with actual security group
  subnet_ids            = ["subnet-CHANGE_ME"]  # Update with actual subnet IDs
  engine_version        = "14.6"
  
  tags = local.common_tags
}

# Redis Cluster Module
# Requirement: Development Environment Provisioning
module "redis" {
  source = "../../modules/redis"

  redis_cluster_id           = "${local.name_prefix}-redis"
  redis_node_type           = "cache.t3.micro"
  redis_num_cache_nodes     = var.redis_node_count
  redis_engine_version      = "7.0"
  redis_parameter_group_name = "${local.name_prefix}-redis-params"
  
  environment              = var.environment
  vpc_id                  = "vpc-CHANGE_ME"  # Update with actual VPC ID
  allowed_security_group_ids = ["sg-CHANGE_ME"]  # Update with actual security groups
  subnet_ids              = ["subnet-CHANGE_ME"]  # Update with actual subnet IDs
  sns_topic_arn          = "arn:aws:sns:REGION:ACCOUNT:TOPIC"  # Update with actual SNS topic
  
  node_type              = "cache.t3.micro"
  num_cache_nodes        = var.redis_node_count
}

# Amazon MQ Module
# Requirement: Development Environment Provisioning
module "mq" {
  source = "../../modules/mq"

  broker_name         = "${local.name_prefix}-mq"
  engine_type         = "ActiveMQ"
  engine_version      = "5.15.14"
  host_instance_type  = var.mq_instance_size
  deployment_mode     = "SINGLE_INSTANCE"  # Single instance for dev environment
  
  vpc_id              = "vpc-CHANGE_ME"  # Update with actual VPC ID
  subnet_ids          = ["subnet-CHANGE_ME"]  # Update with actual subnet IDs
  allowed_security_groups = ["sg-CHANGE_ME"]  # Update with actual security groups
  environment         = var.environment
  
  maintenance_day_of_week = "SUNDAY"
  maintenance_time_of_day = "03:00"
  maintenance_time_zone   = "UTC"
  
  mq_users = [
    {
      username = "mqadmin"
      password = "CHANGE_ME_BEFORE_APPLY"  # Should be changed and managed securely
      console_access = true
    }
  ]
  
  alarm_actions = ["arn:aws:sns:REGION:ACCOUNT:TOPIC"]  # Update with actual SNS topic
}

# Import required variables
variable "aws_region" {
  type = string
}

variable "environment" {
  type = string
}

variable "eks_cluster_name" {
  type = string
}

variable "rds_instance_type" {
  type = string
}

variable "redis_node_count" {
  type = number
}

variable "mq_instance_size" {
  type = string
}

# Outputs
output "eks_cluster_endpoint" {
  value = module.eks.eks_cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.redis.redis_endpoint
}

output "mq_endpoint" {
  value = module.mq.mq_broker_endpoint
}