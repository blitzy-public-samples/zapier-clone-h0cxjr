# AWS MQ Module - Version 1.5+
# This module provisions and manages Amazon MQ resources for message queuing
# Requirements addressed:
# - Message Queue Infrastructure (Technical Specification/System Architecture/Data Storage Components)
# - Scalable and Reliable MQ (Technical Specification/System Architecture/Component Details)

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Local variables for configuration
locals {
  broker_name        = var.broker_name != "" ? var.broker_name : "default-mq-broker"
  engine_type        = var.engine_type != "" ? var.engine_type : "ActiveMQ"
  engine_version     = var.engine_version != "" ? var.engine_version : "5.15.14"
  deployment_mode    = var.deployment_mode != "" ? var.deployment_mode : "ACTIVE_STANDBY_MULTI_AZ"
  host_instance_type = var.host_instance_type != "" ? var.host_instance_type : "mq.m5.large"
  
  default_tags = {
    Environment = var.environment
    Managed_By  = "terraform"
    Purpose     = "message-queue"
  }
}

# Security group for MQ broker
resource "aws_security_group" "mq_broker" {
  name_prefix = "${local.broker_name}-sg"
  vpc_id      = var.vpc_id
  description = "Security group for Amazon MQ broker"

  # ActiveMQ console access
  ingress {
    from_port       = 8162
    to_port         = 8162
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
    description     = "ActiveMQ Console Access"
  }

  # OpenWire protocol
  ingress {
    from_port       = 61617
    to_port         = 61617
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
    description     = "OpenWire SSL"
  }

  # AMQP protocol
  ingress {
    from_port       = 5671
    to_port         = 5671
    protocol        = "tcp"
    security_groups = var.allowed_security_groups
    description     = "AMQP SSL"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    local.default_tags,
    {
      Name = "${local.broker_name}-sg"
    }
  )
}

# KMS key for encryption at rest
resource "aws_kms_key" "mq_encryption" {
  description             = "KMS key for Amazon MQ encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  
  tags = merge(
    local.default_tags,
    {
      Name = "${local.broker_name}-kms"
    }
  )
}

# KMS key alias
resource "aws_kms_alias" "mq_encryption" {
  name          = "alias/${local.broker_name}-key"
  target_key_id = aws_kms_key.mq_encryption.key_id
}

# Amazon MQ broker
resource "aws_mq_broker" "main" {
  broker_name        = local.broker_name
  engine_type        = local.engine_type
  engine_version     = local.engine_version
  host_instance_type = local.host_instance_type
  deployment_mode    = local.deployment_mode
  
  security_groups    = [aws_security_group.mq_broker.id]
  subnet_ids         = var.subnet_ids

  encryption_options {
    kms_key_id        = aws_kms_key.mq_encryption.arn
    use_aws_owned_key = false
  }

  maintenance_window_start_time {
    day_of_week = var.maintenance_day_of_week
    time_of_day = var.maintenance_time_of_day
    time_zone   = var.maintenance_time_zone
  }

  logs {
    general = true
    audit   = true
  }

  dynamic "user" {
    for_each = var.mq_users
    content {
      username       = user.value.username
      password       = user.value.password
      console_access = lookup(user.value, "console_access", false)
      groups         = lookup(user.value, "groups", [])
    }
  }

  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  publicly_accessible       = false

  tags = merge(
    local.default_tags,
    {
      Name = local.broker_name
    },
    var.additional_tags
  )
}

# CloudWatch alarms for monitoring
resource "aws_cloudwatch_metric_alarm" "broker_cpu" {
  alarm_name          = "${local.broker_name}-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name        = "CpuUtilization"
  namespace          = "AWS/AmazonMQ"
  period             = 300
  statistic          = "Average"
  threshold          = 80
  alarm_description  = "MQ broker CPU utilization is too high"
  alarm_actions      = var.alarm_actions

  dimensions = {
    Broker = aws_mq_broker.main.id
  }

  tags = merge(
    local.default_tags,
    {
      Name = "${local.broker_name}-cpu-alarm"
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "broker_memory" {
  alarm_name          = "${local.broker_name}-memory-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name        = "HeapUsage"
  namespace          = "AWS/AmazonMQ"
  period             = 300
  statistic          = "Average"
  threshold          = 80
  alarm_description  = "MQ broker memory utilization is too high"
  alarm_actions      = var.alarm_actions

  dimensions = {
    Broker = aws_mq_broker.main.id
  }

  tags = merge(
    local.default_tags,
    {
      Name = "${local.broker_name}-memory-alarm"
    }
  )
}