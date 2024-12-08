# Requirement: Database Provisioning
# Location: Technical Specification/Infrastructure/Databases & Storage
# Exposes key attributes of the provisioned RDS instance for use by other modules

# The connection endpoint for the RDS instance
# This output can be used to configure application connection strings
output "rds_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
  sensitive   = false
}

# The Amazon Resource Name (ARN) of the RDS instance
# This output can be used for IAM policies or cross-stack references
output "rds_arn" {
  description = "The ARN of the RDS instance"
  value       = aws_db_instance.main.arn
  sensitive   = false
}