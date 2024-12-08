# List of tasks that require human attention:
# 1. Verify that all output values are correctly mapped to the actual resource attributes
# 2. Ensure sensitive information is properly marked as sensitive
# 3. Review output descriptions for clarity and completeness
# 4. Validate that the output values meet the needs of dependent systems

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Implements output values for Terraform configurations to expose critical infrastructure details.

# EKS Cluster Endpoint
output "eks_cluster_endpoint" {
  description = "The endpoint URL for the EKS cluster API server"
  value       = module.eks.cluster_endpoint
  sensitive   = false
}

# RDS Database Endpoint
output "rds_endpoint" {
  description = "The connection endpoint for the RDS database instance"
  value       = module.rds.endpoint
  sensitive   = false
}

# Redis Cache Endpoint
output "redis_endpoint" {
  description = "The connection endpoint for the Redis cluster"
  value       = module.redis.primary_endpoint
  sensitive   = false
}

# Amazon MQ Broker Endpoint
output "mq_endpoint" {
  description = "The connection endpoint for the Amazon MQ broker"
  value       = module.mq.broker_endpoints
  sensitive   = false
}

# Additional metadata outputs
output "environment" {
  description = "The deployment environment name"
  value       = var.environment
}

output "aws_region" {
  description = "The AWS region where resources are deployed"
  value       = var.aws_region
}

# Resource identifiers
output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "rds_identifier" {
  description = "The identifier of the RDS instance"
  value       = module.rds.identifier
}

output "redis_cluster_id" {
  description = "The ID of the Redis cluster"
  value       = module.redis.cluster_id
}

output "mq_broker_id" {
  description = "The ID of the Amazon MQ broker"
  value       = module.mq.broker_id
}

# Resource ARNs for cross-account access
output "eks_cluster_arn" {
  description = "The ARN of the EKS cluster"
  value       = module.eks.cluster_arn
}

output "rds_arn" {
  description = "The ARN of the RDS instance"
  value       = module.rds.arn
}

output "redis_arn" {
  description = "The ARN of the Redis cluster"
  value       = module.redis.arn
}

output "mq_broker_arn" {
  description = "The ARN of the Amazon MQ broker"
  value       = module.mq.broker_arn
}