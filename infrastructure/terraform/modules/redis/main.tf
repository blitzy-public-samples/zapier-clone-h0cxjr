# Required providers and versions
# AWS Provider v5.0.0
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0.0"
    }
  }
}

# Local variables for configuration
locals {
  # Tags for resource identification and management
  common_tags = {
    Environment = var.environment
    Project     = "workflow-automation-platform"
    ManagedBy   = "terraform"
  }

  # Redis port configuration
  redis_port = 6379
}

# Security group for Redis cluster
# Requirement: Infrastructure as Code - Defines security controls for Redis access
resource "aws_security_group" "redis_sg" {
  name        = "${var.environment}-redis-security-group"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  # Ingress rule for Redis port
  ingress {
    from_port       = local.redis_port
    to_port         = local.redis_port
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
    description     = "Allow Redis traffic from application servers"
  }

  # Egress rule to allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-redis-sg"
    }
  )
}

# Redis subnet group
resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name        = "${var.environment}-redis-subnet-group"
  description = "Subnet group for Redis cluster"
  subnet_ids  = var.subnet_ids
}

# Redis parameter group
resource "aws_elasticache_parameter_group" "redis_params" {
  family      = "redis7.x"
  name        = "${var.environment}-redis-params"
  description = "Redis parameter group for workflow automation platform"

  # Requirement: Cache Layer Configuration - Optimized parameters for performance
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }
}

# Redis cluster
# Requirement: Cache Layer Configuration - Implements Redis cache layer
resource "aws_elasticache_cluster" "redis_cluster" {
  cluster_id           = "${var.environment}-redis-cluster"
  engine              = "redis"
  node_type           = var.node_type
  num_cache_nodes     = var.num_cache_nodes
  parameter_group_name = aws_elasticache_parameter_group.redis_params.name
  port                = local.redis_port
  security_group_ids  = [aws_security_group.redis_sg.id]
  subnet_group_name   = aws_elasticache_subnet_group.redis_subnet_group.name

  # Redis version should be specified for production readiness
  engine_version = "7.0"

  # Maintenance window should be during off-peak hours
  maintenance_window = "sun:05:00-sun:06:00"

  # Enable automatic backup for data persistence
  snapshot_retention_limit = var.environment == "prod" ? 7 : 1
  snapshot_window         = "03:00-04:00"

  # Enable encryption at rest for security
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Apply common tags
  tags = merge(
    local.common_tags,
    {
      Name = "${var.environment}-redis-cluster"
    }
  )

  # Notification configuration for cluster events
  notification_topic_arn = var.sns_topic_arn

  # Advanced configurations
  apply_immediately = var.environment != "prod"
}

# CloudWatch alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.environment}-redis-cpu-utilization"
  alarm_description   = "Redis cluster CPU utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "CPUUtilization"
  namespace          = "AWS/ElastiCache"
  period             = "300"
  statistic          = "Average"
  threshold          = "75"
  alarm_actions      = [var.sns_topic_arn]
  ok_actions         = [var.sns_topic_arn]

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.redis_cluster.id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${var.environment}-redis-memory-utilization"
  alarm_description   = "Redis cluster memory utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name        = "DatabaseMemoryUsagePercentage"
  namespace          = "AWS/ElastiCache"
  period             = "300"
  statistic          = "Average"
  threshold          = "80"
  alarm_actions      = [var.sns_topic_arn]
  ok_actions         = [var.sns_topic_arn]

  dimensions = {
    CacheClusterId = aws_elasticache_cluster.redis_cluster.id
  }

  tags = local.common_tags
}