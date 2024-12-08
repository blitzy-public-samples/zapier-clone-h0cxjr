# List of tasks that require human attention:
# 1. Verify AWS credentials and permissions for staging environment
# 2. Review resource sizing and capacity settings for staging workloads
# 3. Validate network configuration and VPC settings
# 4. Ensure proper backup and retention policies are configured
# 5. Review security group and access control settings
# 6. Confirm monitoring and alerting thresholds are appropriate

# Requirement: Staging Environment Configuration
# Technical Specification/Infrastructure/Deployment Environment
# Implements staging environment with reduced capacity for pre-production testing

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"  # AWS Provider version: 5.0.0
      version = "~> 5.0.0"
    }
  }
}

# Configure provider with staging environment settings
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
  name_prefix = "${var.environment}-workflow-platform"
  
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "workflow-automation-platform"
  }
}

# Import main infrastructure module
# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
module "main_infrastructure" {
  source = "../../main"

  # Environment configuration
  environment     = var.environment
  aws_region      = var.aws_region

  # EKS configuration
  eks_cluster_name = var.eks_cluster_name

  # RDS configuration
  rds_instance_type = var.rds_instance_type

  # Redis configuration
  redis_node_count = var.redis_node_count

  # MQ configuration
  mq_instance_size = var.mq_instance_size

  # Additional staging-specific configurations
  providers = {
    aws = aws
  }
}

# Staging-specific CloudWatch alarms
resource "aws_cloudwatch_metric_alarm" "staging_cpu_utilization" {
  alarm_name          = "${local.name_prefix}-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/EKS"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_description  = "This metric monitors EKS cluster CPU utilization in staging"
  alarm_actions      = [aws_sns_topic.staging_alerts.arn]

  dimensions = {
    ClusterName = var.eks_cluster_name
  }

  tags = local.common_tags
}

# SNS topic for staging environment alerts
resource "aws_sns_topic" "staging_alerts" {
  name = "${local.name_prefix}-alerts"
  
  tags = local.common_tags
}

# Staging environment outputs
output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.main_infrastructure.eks_cluster_endpoint
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.main_infrastructure.rds_instance_endpoint
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.main_infrastructure.redis_endpoint
}

output "mq_endpoint" {
  description = "MQ broker endpoint"
  value       = module.main_infrastructure.mq_broker_endpoint
}

# Store sensitive information in SSM Parameter Store
resource "aws_ssm_parameter" "staging_endpoints" {
  name        = "/${local.name_prefix}/endpoints"
  description = "Staging environment endpoints"
  type        = "SecureString"
  value = jsonencode({
    eks_endpoint   = module.main_infrastructure.eks_cluster_endpoint
    rds_endpoint   = module.main_infrastructure.rds_instance_endpoint
    redis_endpoint = module.main_infrastructure.redis_endpoint
    mq_endpoint    = module.main_infrastructure.mq_broker_endpoint
  })

  tags = local.common_tags
}

# Staging-specific backup policies
resource "aws_backup_plan" "staging" {
  name = "${local.name_prefix}-backup-plan"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.staging.name
    schedule          = "cron(0 5 ? * * *)"  # Daily at 5 AM UTC

    lifecycle {
      delete_after = 14  # Keep backups for 14 days in staging
    }
  }

  tags = local.common_tags
}

resource "aws_backup_vault" "staging" {
  name = "${local.name_prefix}-backup-vault"
  
  tags = local.common_tags
}

# Staging-specific security group
resource "aws_security_group" "staging_common" {
  name_prefix = "${local.name_prefix}-common-"
  description = "Common security group for staging environment"
  vpc_id      = module.main_infrastructure.vpc_id

  # Allow internal communication
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  # Allow outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}