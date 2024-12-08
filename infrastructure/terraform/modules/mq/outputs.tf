# Requirements addressed:
# - Message Queue Infrastructure (Technical Specification/System Architecture/Data Storage Components)
# - Scalable and Reliable MQ (Technical Specification/System Architecture/Component Details)

output "mq_broker_id" {
  description = "The unique identifier of the MQ broker"
  value       = aws_mq_broker.main.id
}

output "mq_broker_endpoint" {
  description = "The endpoint URL of the MQ broker"
  value       = aws_mq_broker.main.instances[0].endpoints[0]
}