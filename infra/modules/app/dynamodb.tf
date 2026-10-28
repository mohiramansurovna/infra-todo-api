resource "aws_dynamodb_table" "todos" {
  name = "todos-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = { Name = "${local.name}-todos" }
}