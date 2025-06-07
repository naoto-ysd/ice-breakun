// ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.ecs_cluster_name
  // 必要に応じてCloudWatchやKMS設定を追加
}

// ECS Task Definition
resource "aws_ecs_task_definition" "main" {
  family                   = var.ecs_task_family
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn
  container_definitions    = var.ecs_container_definitions // JSON形式
}

// ECS Service
resource "aws_ecs_service" "main" {
  name            = var.ecs_service_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.main.arn
  desired_count   = var.ecs_service_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = var.ecs_service_subnets
    security_groups  = var.ecs_service_security_groups
    assign_public_ip = var.ecs_service_assign_public_ip
  }
  // 必要に応じてALBやService Discovery等を追加
}

variable "ecs_cluster_name" {}
variable "ecs_task_family" {}
variable "ecs_task_cpu" {}
variable "ecs_task_memory" {}
variable "ecs_task_execution_role_arn" {}
variable "ecs_task_role_arn" {}
variable "ecs_container_definitions" {}
variable "ecs_service_name" {}
variable "ecs_service_desired_count" {}
variable "ecs_service_subnets" { type = list(string) }
variable "ecs_service_security_groups" { type = list(string) }
variable "ecs_service_assign_public_ip" { type = bool } 
