# Human Tasks:
# 1. Review and adjust the default values for each variable based on your specific environment needs
# 2. Ensure the redis_parameter_group_name follows your organization's naming convention
# 3. Verify that the redis_node_type selected meets your performance requirements
# 4. Confirm that the redis_engine_version is compatible with your application requirements

# Requirement: Cache Layer Configuration
# Defines core Redis cluster configuration variables
variable "redis_cluster_id" {
  description = "Unique identifier for the Redis cluster"
  type        = string
  validation {
    condition     = length(var.redis_cluster_id) <= 40 && can(regex("^[a-zA-Z0-9-]*$", var.redis_cluster_id))
    error_message = "The redis_cluster_id must be alphanumeric, max 40 characters, and may contain hyphens."
  }
}

# Requirement: Cache Layer Configuration
# Specifies the compute and memory capacity of the Redis nodes
variable "redis_node_type" {
  description = "Instance type for the Redis nodes"
  type        = string
  validation {
    condition     = can(regex("^cache\\.", var.redis_node_type))
    error_message = "The redis_node_type must be a valid AWS ElastiCache node type (e.g., cache.t3.micro, cache.m5.large)."
  }
}

# Requirement: Cache Layer Configuration
# Defines the number of nodes in the Redis cluster
variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the Redis cluster"
  type        = number
  validation {
    condition     = var.redis_num_cache_nodes >= 1 && var.redis_num_cache_nodes <= 6
    error_message = "The redis_num_cache_nodes must be between 1 and 6."
  }
}

# Requirement: Infrastructure as Code
# Specifies the Redis engine version for compatibility and features
variable "redis_engine_version" {
  description = "Version of the Redis engine to use"
  type        = string
  validation {
    condition     = can(regex("^[0-9]\\.[0-9]$", var.redis_engine_version))
    error_message = "The redis_engine_version must be in the format 'X.Y' (e.g., '7.0')."
  }
}

# Requirement: Infrastructure as Code
# Defines the parameter group for Redis configuration settings
variable "redis_parameter_group_name" {
  description = "Name of the parameter group to associate with the Redis cluster"
  type        = string
  validation {
    condition     = length(var.redis_parameter_group_name) <= 255 && can(regex("^[a-zA-Z0-9-]*$", var.redis_parameter_group_name))
    error_message = "The redis_parameter_group_name must be alphanumeric, max 255 characters, and may contain hyphens."
  }
}

# Additional required variables referenced in main.tf
variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "The environment must be one of: dev, staging, prod."
  }
}

variable "vpc_id" {
  description = "ID of the VPC where Redis cluster will be deployed"
  type        = string
  validation {
    condition     = can(regex("^vpc-[a-f0-9]+$", var.vpc_id))
    error_message = "The vpc_id must be a valid VPC ID format (e.g., vpc-12345678)."
  }
}

variable "allowed_security_group_ids" {
  description = "List of security group IDs allowed to access the Redis cluster"
  type        = list(string)
  validation {
    condition     = length(var.allowed_security_group_ids) > 0
    error_message = "At least one security group ID must be provided."
  }
}

variable "subnet_ids" {
  description = "List of subnet IDs where Redis nodes will be deployed"
  type        = list(string)
  validation {
    condition     = length(var.subnet_ids) >= 2
    error_message = "At least two subnet IDs must be provided for high availability."
  }
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic for Redis notifications and alarms"
  type        = string
  validation {
    condition     = can(regex("^arn:aws:sns:[a-z0-9-]+:[0-9]+:.+$", var.sns_topic_arn))
    error_message = "The sns_topic_arn must be a valid SNS topic ARN."
  }
}

variable "node_type" {
  description = "The compute and memory capacity of the nodes"
  type        = string
  validation {
    condition     = can(regex("^cache\\.", var.node_type))
    error_message = "The node_type must be a valid AWS ElastiCache node type."
  }
}

variable "num_cache_nodes" {
  description = "The number of cache nodes in the cluster"
  type        = number
  validation {
    condition     = var.num_cache_nodes >= 1 && var.num_cache_nodes <= 6
    error_message = "The num_cache_nodes must be between 1 and 6."
  }
}