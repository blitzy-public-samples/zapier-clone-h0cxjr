# Requirement: Cache Layer Configuration
# Location: Technical Specification/System Architecture/Data Storage Components
# Exposes the Redis cluster endpoint for application connectivity
output "redis_endpoint" {
  description = "The endpoint URL of the Redis cluster"
  value       = aws_elasticache_cluster.redis_cluster.endpoint
}

# Requirement: Infrastructure as Code
# Location: Technical Specification/Development & Deployment/Infrastructure Automation
# Exposes the security group ID for integration with other modules
output "redis_security_group_id" {
  description = "The ID of the security group associated with the Redis cluster"
  value       = aws_security_group.redis_sg.id
}