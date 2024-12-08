# List of tasks that require human attention:
# 1. Review and adjust default values based on environment requirements
# 2. Ensure password policies meet security requirements
# 3. Validate instance class selections against AWS regional availability
# 4. Consider cost implications of storage and instance class choices
# 5. Review encryption requirements for specific regions

# Requirement: Database Provisioning
variable "rds_identifier" {
  description = "Unique identifier for the RDS instance"
  type        = string
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]*$", var.rds_identifier))
    error_message = "The RDS identifier must begin with a letter and only contain alphanumeric characters and hyphens."
  }
}

# Requirement: Database Provisioning
variable "rds_engine" {
  description = "Database engine to use for the RDS instance"
  type        = string
  
  validation {
    condition     = contains(["mysql", "postgres", "mariadb", "oracle-se2", "sqlserver-ex"], var.rds_engine)
    error_message = "The engine type must be one of: mysql, postgres, mariadb, oracle-se2, sqlserver-ex."
  }
}

# Requirement: Scalability and High Availability
variable "rds_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  
  validation {
    condition     = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.rds_instance_class))
    error_message = "The instance class must be a valid RDS instance type (e.g., db.t3.micro, db.r5.large)."
  }
}

# Requirement: Scalability and High Availability
variable "rds_allocated_storage" {
  description = "Amount of storage allocated for the RDS instance in GB"
  type        = number
  
  validation {
    condition     = var.rds_allocated_storage >= 20 && var.rds_allocated_storage <= 65536
    error_message = "Allocated storage must be between 20 GB and 65536 GB."
  }
}

# Requirement: Security and Encryption
variable "rds_username" {
  description = "Master username for the RDS instance"
  type        = string
  sensitive   = true
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.rds_username))
    error_message = "The username must begin with a letter and only contain alphanumeric characters and underscores."
  }
}

# Requirement: Security and Encryption
variable "rds_password" {
  description = "Master password for the RDS instance"
  type        = string
  sensitive   = true
  
  validation {
    condition     = can(regex("^[a-zA-Z0-9!@#$%^&*()_+=-]{8,}$", var.rds_password))
    error_message = "The password must be at least 8 characters and contain valid characters."
  }
}

# Requirement: Database Provisioning
variable "rds_db_name" {
  description = "Name of the initial database to create"
  type        = string
  
  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9_]*$", var.rds_db_name))
    error_message = "The database name must begin with a letter and only contain alphanumeric characters and underscores."
  }
}

# Requirement: Scalability and High Availability
variable "rds_multi_az" {
  description = "Whether to enable multi-AZ deployment for high availability"
  type        = bool
  default     = true
}

# Requirement: Security and Encryption
variable "rds_storage_encrypted" {
  description = "Whether to enable storage encryption for the RDS instance"
  type        = bool
  default     = true
}

# Additional required variables based on main.tf dependencies

variable "vpc_security_group_ids" {
  description = "List of VPC security group IDs"
  type        = list(string)
}

variable "subnet_ids" {
  description = "List of subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "engine_version" {
  description = "Version of the database engine"
  type        = string
}

# Tags for resource identification
variable "tags" {
  description = "A map of tags to assign to the RDS resources"
  type        = map(string)
  default     = {}
}