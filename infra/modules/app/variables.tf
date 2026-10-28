variable "environment" {
  type        = string
  description = "Environment name, such as dev or prod"
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "private_subnet_id" {
  type = string
}