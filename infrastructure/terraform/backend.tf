# Requirement: Infrastructure as Code
# Technical Specification/Development & Deployment/Infrastructure Automation
# Implements backend configuration for Terraform to ensure consistent state management and collaboration.

# Terraform version constraint
terraform {
  # AWS Provider version: 5.0.0
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }

  # Configure S3 backend for storing Terraform state remotely
  backend "s3" {
    # S3 bucket name will be dynamically set based on environment
    bucket = "terraform-state-${var.environment}"
    
    # State file path within bucket includes environment for isolation
    key = "state/${var.environment}/terraform.tfstate"
    
    # AWS region for the S3 bucket
    region = var.aws_region
    
    # Enable encryption at rest for state file
    encrypt = true
    
    # DynamoDB table for state locking
    dynamodb_table = "terraform-locks-${var.environment}"
    
    # Enable versioning to maintain state file history
    versioning = true
    
    # Enable server-side encryption
    server_side_encryption_configuration {
      rule {
        apply_server_side_encryption_by_default {
          sse_algorithm = "AES256"
        }
      }
    }
  }
}

# Import required variables from variables.tf
variable "aws_region" {
  type = string
}

variable "environment" {
  type = string
}