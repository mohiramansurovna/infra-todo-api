output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "instance_id" {
  value = aws_instance.app.id
}

output "table_name" {
  value = aws_dynamodb_table.todos.name
}

output "artifacts_bucket" {
  value = aws_s3_bucket.artifacts.bucket
}