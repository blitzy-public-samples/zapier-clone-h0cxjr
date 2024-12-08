# AWS Provider version constraint
# AWS Provider version: 5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# List of tasks that require human attention:
# 1. Ensure AWS credentials are properly configured
# 2. Verify VPC and subnet configurations exist
# 3. Configure appropriate security groups
# 4. Set up parameter groups if custom DB parameters are needed
# 5. Plan for backup retention and maintenance windows
# 6. Consider implementing AWS Secrets Manager for credential management

# Variables for RDS configuration
variable "identifier" {
  description = "Unique identifier for the RDS instance"
  type        = string
}

variable "engine" {
  description = "Database engine to use for the RDS instance"
  type        = string
}

variable "instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
}

variable "allocated_storage" {
  description = "Amount of storage allocated for the RDS instance in GB"
  type        = number
}

variable "username" {
  description = "Master username for the RDS instance"
  type        = string
  sensitive   = true
}

variable "password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Name of the initial database to create"
  type        = string
}

variable "multi_az" {
  description = "Whether to enable multi-AZ deployment for high availability"
  type        = bool
  default     = true
}

variable "vpc_security_group_ids" {
  description = "List of VPC security group IDs"
  type        = list(string)
}

variable "subnet_ids" {
  description = "List of subnet IDs for the DB subnet group"
  type        = list(string)
}

# Create DB subnet group
# Requirement: Scalability and High Availability
resource "aws_db_subnet_group" "main" {
  name        = "${var.identifier}-subnet-group"
  description = "Subnet group for RDS instance ${var.identifier}"
  subnet_ids  = var.subnet_ids

  tags = {
    Name = "${var.identifier}-subnet-group"
  }
}

# Create DB parameter group
# Requirement: Database Provisioning
resource "aws_db_parameter_group" "main" {
  name        = "${var.identifier}-parameter-group"
  family      = "${var.engine}${var.engine_version}"
  description = "Parameter group for RDS instance ${var.identifier}"

  # Example parameters - adjust based on your needs
  parameter {
    name  = "max_connections"
    value = "1000"
  }

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }
}

# Create RDS instance
# Requirement: Database Provisioning, Scalability and High Availability, Security and Encryption
resource "aws_db_instance" "main" {
  identifier = var.identifier
  engine     = var.engine

  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage

  db_name  = var.db_name
  username = var.username
  password = var.password

  # High Availability Configuration
  multi_az               = var.multi_az
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.vpc_security_group_ids
  parameter_group_name   = aws_db_parameter_group.main.name

  # Security Configuration
  storage_encrypted        = true  # Requirement: Security and Encryption
  backup_retention_period  = 7     # Keep backups for 7 days
  backup_window           = "03:00-04:00"  # UTC
  maintenance_window      = "Mon:04:00-Mon:05:00"  # UTC

  # Performance and Monitoring
  monitoring_interval = 60  # Enhanced monitoring enabled
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  # Network Configuration
  publicly_accessible    = false
  port                  = 5432  # Default PostgreSQL port

  # Deletion Protection
  deletion_protection = true

  # Auto Minor Version Upgrade
  auto_minor_version_upgrade = true

  tags = {
    Name        = var.identifier
    Environment = terraform.workspace
  }
}

# Create IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.identifier}-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

# Attach enhanced monitoring policy to the IAM role
resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Outputs
output "endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "arn" {
  description = "The ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}