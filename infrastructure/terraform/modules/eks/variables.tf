# Version: hashicorp/terraform v1.5.0

# Human Tasks:
# 1. Review and adjust variable default values based on environment requirements
# 2. Ensure variable values comply with organization's naming conventions
# 3. Validate AWS region matches the organization's deployment regions

# Requirement: Infrastructure as Code
# Description: Input variables for EKS cluster configuration to ensure consistent 
# and repeatable infrastructure provisioning across environments

variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.eks_cluster_name))
    error_message = "EKS cluster name must start with a letter and can only contain letters, numbers, and hyphens."
  }

  validation {
    condition     = length(var.eks_cluster_name) >= 3 && length(var.eks_cluster_name) <= 100
    error_message = "EKS cluster name must be between 3 and 100 characters."
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region where the EKS cluster will be created"
  
  validation {
    condition     = can(regex("^[a-z]{2}(-[a-z]+)+-\\d$", var.aws_region))
    error_message = "AWS region must be in the format: us-east-1, eu-west-1, etc."
  }
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, staging, prod)"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# Local variables for internal module use
locals {
  # Add standard name prefix for all resources
  resource_prefix = "${var.eks_cluster_name}-${var.environment}"
  
  # Common tags to be applied to all resources
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "workflow-automation-platform"
    Region      = var.aws_region
  }
}