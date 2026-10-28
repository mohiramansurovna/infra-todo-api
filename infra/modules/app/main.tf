data "aws_region" "current" {}

locals {
  name = "infra-todo-${var.environment}"
}