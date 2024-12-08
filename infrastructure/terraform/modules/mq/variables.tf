# Human Tasks:
# 1. Review and adjust the default values for variables according to your environment needs
# 2. Ensure the VPC and subnet IDs are properly configured in your environment
# 3. Configure appropriate security groups for access control
# 4. Set up CloudWatch alarm actions if monitoring is required
# 5. Review maintenance window settings based on your operational requirements

# Requirements addressed:
# - Message Queue Infrastructure (Technical Specification/System Architecture/Data Storage Components)
# - Scalable and Reliable MQ (Technical Specification/System Architecture/Component Details)

variable "broker_name" {
  description = "The name of the MQ broker"
  type        = string
  default     = "default-mq-broker"
}

variable "engine_type" {
  description = "The type of MQ engine to use"
  type        = string
  default     = "ActiveMQ"
  validation {
    condition     = contains(["ActiveMQ", "RabbitMQ"], var.engine_type)
    error_message = "Engine type must be either ActiveMQ or RabbitMQ."
  }
}

variable "engine_version" {
  description = "The version of the MQ engine"
  type        = string
  default     = "5.15.14"
}

variable "deployment_mode" {
  description = "The deployment mode for the MQ broker"
  type        = string
  default     = "ACTIVE_STANDBY_MULTI_AZ"
  validation {
    condition     = contains(["SINGLE_INSTANCE", "ACTIVE_STANDBY_MULTI_AZ", "CLUSTER_MULTI_AZ"], var.deployment_mode)
    error_message = "Deployment mode must be one of: SINGLE_INSTANCE, ACTIVE_STANDBY_MULTI_AZ, or CLUSTER_MULTI_AZ."
  }
}

variable "host_instance_type" {
  description = "The instance type for the MQ broker host"
  type        = string
  default     = "mq.m5.large"
}

variable "mq_users" {
  description = "List of user maps with username, password, console_access, and groups for the MQ broker"
  type = list(object({
    username       = string
    password       = string
    console_access = optional(bool, false)
    groups         = optional(list(string), [])
  }))
  default = []

  validation {
    condition     = length([for user in var.mq_users : user.password if length(user.password) < 12]) == 0
    error_message = "All user passwords must be at least 12 characters long."
  }
}

variable "vpc_id" {
  description = "The ID of the VPC where the MQ broker will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for the MQ broker deployment"
  type        = list(string)
}

variable "allowed_security_groups" {
  description = "List of security group IDs allowed to access the MQ broker"
  type        = list(string)
  default     = []
}

variable "environment" {
  description = "Environment name for resource tagging"
  type        = string
}

variable "maintenance_day_of_week" {
  description = "The day of the week for maintenance window"
  type        = string
  default     = "SUNDAY"
  validation {
    condition     = contains(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"], var.maintenance_day_of_week)
    error_message = "Day of week must be a valid day in uppercase."
  }
}

variable "maintenance_time_of_day" {
  description = "The time of day for maintenance window (UTC)"
  type        = string
  default     = "03:00"
  validation {
    condition     = can(regex("^([0-1][0-9]|2[0-3]):[0-5][0-9]$", var.maintenance_time_of_day))
    error_message = "Time of day must be in 24-hour format (HH:mm)."
  }
}

variable "maintenance_time_zone" {
  description = "The time zone for the maintenance window"
  type        = string
  default     = "UTC"
}

variable "auto_minor_version_upgrade" {
  description = "Enable automatic minor version upgrades during maintenance window"
  type        = bool
  default     = true
}

variable "alarm_actions" {
  description = "List of ARNs to notify when MQ alarms are triggered"
  type        = list(string)
  default     = []
}

variable "additional_tags" {
  description = "Additional tags to apply to the MQ broker resources"
  type        = map(string)
  default     = {}
}