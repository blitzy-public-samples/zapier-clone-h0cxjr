# Version: hashicorp/terraform v1.5.0

# Requirement: Infrastructure as Code
# Location: Technical Specification/Development & Deployment/Infrastructure Automation
# Description: Defines output variables for the EKS module to expose key attributes 
# of the provisioned EKS cluster for use in other modules or configurations.

output "eks_cluster_name" {
  description = "The name of the provisioned EKS cluster"
  value       = aws_eks_cluster.main.name
  sensitive   = false
}

output "eks_cluster_region" {
  description = "The AWS region where the EKS cluster is provisioned"
  value       = var.aws_region
  sensitive   = false
}

output "eks_cluster_environment" {
  description = "The environment (e.g., dev, staging, prod) of the EKS cluster"
  value       = var.environment
  sensitive   = false
}