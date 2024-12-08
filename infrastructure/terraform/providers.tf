# List of tasks that require human attention:
# 1. Ensure AWS credentials are properly configured in ~/.aws/credentials or via environment variables
# 2. Verify that the AWS region selected meets data residency requirements
# 3. Review and configure any required provider-level configurations like assume role or custom endpoints
# 4. Ensure proper IAM permissions are granted for the AWS provider

# AWS Provider version: 5.0.0
# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Implements provider configurations for Terraform to enable consistent and reliable infrastructure provisioning.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }

  # Require a minimum Terraform version for stability
  required_version = ">= 1.5.0"
}

# Configure the AWS Provider
# Uses variables from variables.tf for region configuration
provider "aws" {
  region  = var.aws_region
  profile = "default"

  # Default tags applied to all resources
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = "workflow-automation-platform"
    }
  }
}