# Terraform AWS EKS Module
# Version: hashicorp/terraform v1.5.0
# Version: hashicorp/aws v5.0.0

# Human Tasks:
# 1. Ensure AWS credentials are properly configured
# 2. Verify VPC and subnet configurations exist
# 3. Configure AWS KMS key for envelope encryption
# 4. Review and adjust node group instance types based on workload requirements
# 5. Validate IAM permissions for EKS cluster creation

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Variables definition
variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
}

variable "aws_region" {
  type        = string
  description = "AWS region where the EKS cluster will be created"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, staging, prod)"
}

# Local variables
locals {
  cluster_name    = var.eks_cluster_name
  cluster_version = "1.27"  # Latest stable EKS version
  
  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "workflow-automation-platform"
  }
}

# EKS Cluster IAM Role
# Requirement: Infrastructure as Code
resource "aws_iam_role" "eks_cluster_role" {
  name = "${local.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# EKS Node Group IAM Role
# Requirement: Scalable and Reliable Infrastructure
resource "aws_iam_role" "eks_node_role" {
  name = "${local.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_role.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_role.name
}

# EKS Cluster
# Requirement: Infrastructure as Code, Scalable and Reliable Infrastructure
resource "aws_eks_cluster" "main" {
  name     = local.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = local.cluster_version

  vpc_config {
    endpoint_private_access = true
    endpoint_public_access  = true
    public_access_cidrs    = ["0.0.0.0/0"]  # Restrict this in production
  }

  encryption_config {
    provider {
      key_arn = aws_kms_key.eks.arn
    }
    resources = ["secrets"]
  }

  enabled_cluster_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]

  tags = local.tags

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# KMS Key for EKS encryption
resource "aws_kms_key" "eks" {
  description             = "KMS key for EKS cluster ${local.cluster_name}"
  deletion_window_in_days = 7
  enable_key_rotation    = true

  tags = local.tags
}

# EKS Node Groups
# Requirement: Scalable and Reliable Infrastructure
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${local.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = data.aws_subnets.private.ids

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.large"]
  capacity_type  = "ON_DEMAND"

  labels = {
    Environment = var.environment
    NodeGroup   = "main"
  }

  tags = local.tags

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry
  ]
}

# Data source for VPC subnets
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  tags = {
    Type = "private"
  }
}

data "aws_vpc" "main" {
  tags = {
    Environment = var.environment
  }
}

# Outputs
output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_region" {
  description = "AWS region of the EKS cluster"
  value       = var.aws_region
}

output "eks_cluster_environment" {
  description = "Environment of the EKS cluster"
  value       = var.environment
}

output "eks_cluster_endpoint" {
  description = "Endpoint for the EKS cluster API server"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_certificate_authority" {
  description = "Certificate authority data for the EKS cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}