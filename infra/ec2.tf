data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.private.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  associate_public_ip_address = false

  metadata_options {
    http_tokens = "required"
  }

    user_data = <<-EOF
    #!/bin/bash
    dnf install -y nodejs22

    useradd --system --no-create-home --shell /sbin/nologin todoapp
    mkdir -p /opt/todo-api
    chown todoapp:todoapp /opt/todo-api

    cat > /etc/systemd/system/todo-api.service <<'UNIT'
    [Unit]
    Description=Todo API
    After=network-online.target
    Wants=network-online.target

    [Service]
    User=todoapp
    WorkingDirectory=/opt/todo-api
    ExecStart=/usr/bin/node dist/index.js
    Environment=PORT=80
    Environment=AWS_REGION=us-east-1
    Environment=TABLE_NAME=${aws_dynamodb_table.todos.name}
    AmbientCapabilities=CAP_NET_BIND_SERVICE
    Restart=always
    RestartSec=3

    [Install]
    WantedBy=multi-user.target
    UNIT

    systemctl daemon-reload
    systemctl enable todo-api
  EOF

  user_data_replace_on_change = true

  depends_on = [
    aws_route_table_association.private,
    aws_nat_gateway.main,
  ]

  tags = { Name = "${local.name}-app" }
}