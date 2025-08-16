# CoreFlow360 Consciousness Infrastructure as Code
# Thermonuclear-scale infrastructure for autonomous business operations

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15"
    }
  }
  
  backend "s3" {
    bucket = "coreflow360-consciousness-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
    
    # Consciousness state locking
    dynamodb_table = "coreflow360-terraform-locks"
    encrypt        = true
  }
}

# Variables for consciousness configuration
variable "environment" {
  description = "Consciousness environment"
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region for consciousness infrastructure"
  type        = string
  default     = "us-west-2"
}

variable "domain_name" {
  description = "Primary consciousness domain"
  type        = string
  default     = "coreflow360.com"
}

variable "consciousness_zones" {
  description = "Availability zones for consciousness distribution"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

# Provider configurations
provider "aws" {
  region = var.region
  
  default_tags {
    tags = {
      Project     = "CoreFlow360"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Purpose     = "BusinessConsciousness"
    }
  }
}

provider "cloudflare" {
  # API token configured via environment variable
}

provider "vercel" {
  # API token configured via environment variable
}

# Data sources
data "aws_availability_zones" "consciousness_zones" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC for consciousness isolation
resource "aws_vpc" "consciousness_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "coreflow360-consciousness-vpc"
  }
}

# Internet Gateway for consciousness connectivity
resource "aws_internet_gateway" "consciousness_igw" {
  vpc_id = aws_vpc.consciousness_vpc.id
  
  tags = {
    Name = "coreflow360-consciousness-igw"
  }
}

# Public subnets for consciousness edge
resource "aws_subnet" "consciousness_public" {
  count = length(var.consciousness_zones)
  
  vpc_id                  = aws_vpc.consciousness_vpc.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = var.consciousness_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "coreflow360-public-${var.consciousness_zones[count.index]}"
    Type = "Public"
  }
}

# Private subnets for consciousness processing
resource "aws_subnet" "consciousness_private" {
  count = length(var.consciousness_zones)
  
  vpc_id            = aws_vpc.consciousness_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.consciousness_zones[count.index]
  
  tags = {
    Name = "coreflow360-private-${var.consciousness_zones[count.index]}"
    Type = "Private"
  }
}

# Database subnets for consciousness memory
resource "aws_subnet" "consciousness_database" {
  count = length(var.consciousness_zones)
  
  vpc_id            = aws_vpc.consciousness_vpc.id
  cidr_block        = "10.0.${count.index + 20}.0/24"
  availability_zone = var.consciousness_zones[count.index]
  
  tags = {
    Name = "coreflow360-db-${var.consciousness_zones[count.index]}"
    Type = "Database"
  }
}

# Route table for public consciousness subnets
resource "aws_route_table" "consciousness_public_rt" {
  vpc_id = aws_vpc.consciousness_vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.consciousness_igw.id
  }
  
  tags = {
    Name = "coreflow360-public-route-table"
  }
}

# Associate public subnets with route table
resource "aws_route_table_association" "consciousness_public_rta" {
  count = length(aws_subnet.consciousness_public)
  
  subnet_id      = aws_subnet.consciousness_public[count.index].id
  route_table_id = aws_route_table.consciousness_public_rt.id
}

# NAT Gateway for consciousness private connectivity
resource "aws_eip" "consciousness_nat_eip" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.consciousness_igw]
  
  tags = {
    Name = "coreflow360-nat-eip"
  }
}

resource "aws_nat_gateway" "consciousness_nat" {
  allocation_id = aws_eip.consciousness_nat_eip.id
  subnet_id     = aws_subnet.consciousness_public[0].id
  
  tags = {
    Name = "coreflow360-consciousness-nat"
  }
  
  depends_on = [aws_internet_gateway.consciousness_igw]
}

# Route table for private consciousness subnets
resource "aws_route_table" "consciousness_private_rt" {
  vpc_id = aws_vpc.consciousness_vpc.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.consciousness_nat.id
  }
  
  tags = {
    Name = "coreflow360-private-route-table"
  }
}

# Associate private subnets with route table
resource "aws_route_table_association" "consciousness_private_rta" {
  count = length(aws_subnet.consciousness_private)
  
  subnet_id      = aws_subnet.consciousness_private[count.index].id
  route_table_id = aws_route_table.consciousness_private_rt.id
}

# Database subnet group for consciousness memory
resource "aws_db_subnet_group" "consciousness_db_subnet_group" {
  name       = "coreflow360-consciousness-db-subnet-group"
  subnet_ids = aws_subnet.consciousness_database[*].id
  
  tags = {
    Name = "coreflow360-consciousness-db-subnet-group"
  }
}

# Security group for consciousness load balancer
resource "aws_security_group" "consciousness_alb_sg" {
  name_prefix = "coreflow360-alb-"
  vpc_id      = aws_vpc.consciousness_vpc.id
  
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "coreflow360-consciousness-alb-sg"
  }
}

# Security group for consciousness application
resource "aws_security_group" "consciousness_app_sg" {
  name_prefix = "coreflow360-app-"
  vpc_id      = aws_vpc.consciousness_vpc.id
  
  ingress {
    description     = "HTTP from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.consciousness_alb_sg.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "coreflow360-consciousness-app-sg"
  }
}

# Security group for consciousness database
resource "aws_security_group" "consciousness_db_sg" {
  name_prefix = "coreflow360-db-"
  vpc_id      = aws_vpc.consciousness_vpc.id
  
  ingress {
    description     = "PostgreSQL from app"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.consciousness_app_sg.id]
  }
  
  tags = {
    Name = "coreflow360-consciousness-db-sg"
  }
}

# RDS instance for consciousness memory
resource "aws_db_instance" "consciousness_database" {
  identifier     = "coreflow360-consciousness-db"
  engine         = "postgres"
  engine_version = "15.4"
  
  instance_class    = "db.r6g.xlarge"
  allocated_storage = 100
  max_allocated_storage = 1000
  storage_type      = "gp3"
  storage_encrypted = true
  
  db_name  = "consciousness"
  username = "consciousness_admin"
  password = random_password.consciousness_db_password.result
  
  vpc_security_group_ids = [aws_security_group.consciousness_db_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.consciousness_db_subnet_group.name
  
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "coreflow360-consciousness-final-snapshot"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  monitoring_role_arn         = aws_iam_role.rds_monitoring_role.arn
  
  tags = {
    Name = "coreflow360-consciousness-database"
  }
}

# Random password for consciousness database
resource "random_password" "consciousness_db_password" {
  length  = 32
  special = true
}

# Store consciousness database password in secrets manager
resource "aws_secretsmanager_secret" "consciousness_db_password" {
  name        = "coreflow360/consciousness/database-password"
  description = "Consciousness database password"
  
  tags = {
    Name = "coreflow360-consciousness-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "consciousness_db_password" {
  secret_id = aws_secretsmanager_secret.consciousness_db_password.id
  secret_string = jsonencode({
    username = aws_db_instance.consciousness_database.username
    password = random_password.consciousness_db_password.result
    endpoint = aws_db_instance.consciousness_database.endpoint
    port     = aws_db_instance.consciousness_database.port
    dbname   = aws_db_instance.consciousness_database.db_name
  })
}

# IAM role for RDS monitoring
resource "aws_iam_role" "rds_monitoring_role" {
  name = "coreflow360-rds-monitoring-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring_role_policy" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# ElastiCache for consciousness caching
resource "aws_elasticache_subnet_group" "consciousness_cache_subnet_group" {
  name       = "coreflow360-cache-subnet-group"
  subnet_ids = aws_subnet.consciousness_private[*].id
}

resource "aws_security_group" "consciousness_cache_sg" {
  name_prefix = "coreflow360-cache-"
  vpc_id      = aws_vpc.consciousness_vpc.id
  
  ingress {
    description     = "Redis from app"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.consciousness_app_sg.id]
  }
  
  tags = {
    Name = "coreflow360-consciousness-cache-sg"
  }
}

resource "aws_elasticache_replication_group" "consciousness_cache" {
  replication_group_id       = "coreflow360-consciousness"
  description                = "Consciousness cache cluster"
  
  node_type                  = "cache.r7g.xlarge"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 3
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.consciousness_cache_subnet_group.name
  security_group_ids = [aws_security_group.consciousness_cache_sg.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                = random_password.consciousness_cache_auth.result
  
  tags = {
    Name = "coreflow360-consciousness-cache"
  }
}

# Random auth token for consciousness cache
resource "random_password" "consciousness_cache_auth" {
  length  = 32
  special = false
}

# Store consciousness cache auth in secrets manager
resource "aws_secretsmanager_secret" "consciousness_cache_auth" {
  name        = "coreflow360/consciousness/cache-auth"
  description = "Consciousness cache authentication token"
}

resource "aws_secretsmanager_secret_version" "consciousness_cache_auth" {
  secret_id = aws_secretsmanager_secret.consciousness_cache_auth.id
  secret_string = jsonencode({
    auth_token = random_password.consciousness_cache_auth.result
    endpoint   = aws_elasticache_replication_group.consciousness_cache.primary_endpoint_address
    port       = aws_elasticache_replication_group.consciousness_cache.port
  })
}

# Cloudflare DNS configuration
resource "cloudflare_zone" "consciousness_zone" {
  zone = var.domain_name
  plan = "pro"
  
  # Enable Cloudflare features for consciousness
  type = "full"
}

resource "cloudflare_zone_settings_override" "consciousness_settings" {
  zone_id = cloudflare_zone.consciousness_zone.id
  
  settings {
    ssl                      = "strict"
    always_https             = "on"
    min_tls_version          = "1.3"
    automatic_https_rewrites = "on"
    security_level           = "medium"
    browser_check            = "on"
    challenge_ttl            = 1800
    development_mode         = "off"
    email_obfuscation        = "on"
    hotlink_protection       = "on"
    ip_geolocation           = "on"
    ipv6                     = "on"
    websockets               = "on"
    
    minify {
      css  = "on"
      js   = "on"
      html = "on"
    }
    
    security_header {
      enabled = true
    }
  }
}

# WAF for consciousness protection
resource "cloudflare_ruleset" "consciousness_waf" {
  zone_id     = cloudflare_zone.consciousness_zone.id
  name        = "Consciousness WAF Rules"
  description = "WAF rules for business consciousness protection"
  kind        = "zone"
  phase       = "http_request_firewall_custom"
  
  rules {
    action = "block"
    expression = "(http.request.uri.path contains \"/api/admin\" and not ip.src in {1.2.3.4})"
    description = "Block admin access from non-whitelisted IPs"
    enabled = true
  }
  
  rules {
    action = "challenge"
    expression = "(http.request.method eq \"POST\" and http.request.uri.path contains \"/api/auth\")"
    description = "Challenge authentication attempts"
    enabled = true
  }
}

# Outputs for consciousness integration
output "consciousness_vpc_id" {
  description = "VPC ID for consciousness infrastructure"
  value       = aws_vpc.consciousness_vpc.id
}

output "consciousness_database_endpoint" {
  description = "Consciousness database endpoint"
  value       = aws_db_instance.consciousness_database.endpoint
  sensitive   = true
}

output "consciousness_cache_endpoint" {
  description = "Consciousness cache endpoint"
  value       = aws_elasticache_replication_group.consciousness_cache.primary_endpoint_address
  sensitive   = true
}

output "consciousness_domain_nameservers" {
  description = "Nameservers for consciousness domain"
  value       = cloudflare_zone.consciousness_zone.name_servers
}