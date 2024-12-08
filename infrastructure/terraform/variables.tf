# List of tasks that require human attention:
# 1. Review and adjust default values for each environment (dev, staging, prod)
# 2. Ensure AWS region selection meets data residency requirements
# 3. Validate instance types are available in selected regions
# 4. Review and adjust node counts based on scalability requirements
# 5. Verify instance sizes meet performance requirements

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines AWS region for resource deployment
variable "aws_region" {
  description = "AWS region where resources will be provisioned"
  type        = string
  
  validation {
    condition     = can(regex("^[a-z]{2}-(central|north|south|east|west|northeast|southeast|northwest|southwest)-[0-9]$", var.aws_region))
    error_message = "AWS region must be a valid region name (e.g., us-east-1, eu-west-1)."
  }
}

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines deployment environment
variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines EKS cluster name
variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.eks_cluster_name))
    error_message = "EKS cluster name must start with a letter and can only contain alphanumeric characters and hyphens."
  }
}

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines RDS instance type
variable "rds_instance_type" {
  description = "Instance type for RDS database"
  type        = string
  
  validation {
    condition     = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.rds_instance_type))
    error_message = "RDS instance type must be a valid instance type (e.g., db.t3.micro, db.r5.large)."
  }
}

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines Redis node count
variable "redis_node_count" {
  description = "Number of nodes in Redis cluster"
  type        = number
  
  validation {
    condition     = var.redis_node_count >= 1 && var.redis_node_count <= 6
    error_message = "Redis node count must be between 1 and 6."
  }
}

# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Defines MQ instance size
variable "mq_instance_size" {
  description = "Instance size for Amazon MQ broker"
  type        = string
  
  validation {
    condition     = can(regex("^mq\\.[a-z0-9]+\\.[a-z0-9]+$", var.mq_instance_size))
    error_message = "MQ instance size must be a valid instance type (e.g., mq.t3.micro, mq.m5.large)."
  }
}