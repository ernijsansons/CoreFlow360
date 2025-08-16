terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
}

# Consciousness-aware GKE Cluster
resource "google_container_cluster" "consciousness_cluster" {
  name     = "${var.cluster_name}-consciousness"
  location = var.region
  
  # Enable Autopilot for optimal resource management
  enable_autopilot = true
  
  # Network configuration for consciousness mesh
  network    = google_compute_network.consciousness_vpc.name
  subnetwork = google_compute_subnetwork.consciousness_subnet.name
  
  # IP allocation for consciousness scaling
  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "10.1.0.0/16"
    services_ipv4_cidr_block = "10.2.0.0/16"
  }
  
  # Enable advanced networking features
  network_policy {
    enabled = true
  }
  
  # Workload Identity for consciousness services
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
  
  # Advanced cluster features
  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    network_policy_config {
      disabled = false
    }
    istio_config {
      disabled = false
      auth     = "AUTH_MUTUAL_TLS"
    }
    cloudrun_config {
      disabled = false
    }
  }
  
  # Consciousness-specific cluster configuration
  cluster_telemetry {
    type = "ENABLED"
  }
  
  # Binary Authorization for consciousness security
  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }
  
  # Enable shielded nodes for consciousness security
  enable_shielded_nodes = true
  
  # Consciousness logging and monitoring
  logging_config {
    enable_components = [
      "SYSTEM_COMPONENTS",
      "WORKLOADS",
      "APISERVER"
    ]
  }
  
  monitoring_config {
    enable_components = [
      "SYSTEM_COMPONENTS",
      "WORKLOADS",
      "APISERVER",
      "CONTROLLER_MANAGER"
    ]
    managed_prometheus {
      enabled = true
    }
  }
  
  # Resource usage export for consciousness optimization
  resource_usage_export_config {
    enable_network_egress_metering = true
    bigquery_destination {
      dataset_id = google_bigquery_dataset.consciousness_metrics.dataset_id
    }
  }
  
  # Consciousness-aware maintenance policy
  maintenance_policy {
    recurring_window {
      start_time = "2023-01-01T09:00:00Z"
      end_time   = "2023-01-01T17:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA,SU"
    }
  }
  
  labels = {
    consciousness-tier = "production"
    ai-optimized      = "true"
    environment       = var.environment
  }
}

# VPC for consciousness mesh networking
resource "google_compute_network" "consciousness_vpc" {
  name                    = "${var.cluster_name}-consciousness-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460
}

# Subnet for consciousness services
resource "google_compute_subnetwork" "consciousness_subnet" {
  name          = "${var.cluster_name}-consciousness-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.consciousness_vpc.id
  
  # Enable private Google access for consciousness services
  private_ip_google_access = true
  
  # Secondary ranges for consciousness scaling
  secondary_ip_range {
    range_name    = "consciousness-pods"
    ip_cidr_range = "10.1.0.0/16"
  }
  
  secondary_ip_range {
    range_name    = "consciousness-services"
    ip_cidr_range = "10.2.0.0/16"
  }
}

# Cloud NAT for consciousness outbound traffic
resource "google_compute_router" "consciousness_router" {
  name    = "${var.cluster_name}-consciousness-router"
  region  = var.region
  network = google_compute_network.consciousness_vpc.id
}

resource "google_compute_router_nat" "consciousness_nat" {
  name                               = "${var.cluster_name}-consciousness-nat"
  router                             = google_compute_router.consciousness_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  
  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall rules for consciousness mesh
resource "google_compute_firewall" "consciousness_internal" {
  name    = "${var.cluster_name}-consciousness-internal"
  network = google_compute_network.consciousness_vpc.name
  
  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080", "9090", "15010", "15011", "15090"]
  }
  
  allow {
    protocol = "udp"
    ports    = ["53"]
  }
  
  source_ranges = ["10.0.0.0/8"]
  target_tags   = ["consciousness-cluster"]
}

# BigQuery dataset for consciousness metrics
resource "google_bigquery_dataset" "consciousness_metrics" {
  dataset_id  = "${replace(var.cluster_name, "-", "_")}_consciousness_metrics"
  description = "Consciousness platform metrics and analytics"
  location    = var.region
  
  labels = {
    consciousness-tier = "production"
    data-type         = "metrics"
  }
}

# Cloud SQL for consciousness state management
resource "google_sql_database_instance" "consciousness_db" {
  name                = "${var.cluster_name}-consciousness-db"
  database_version    = "POSTGRES_14"
  region             = var.region
  deletion_protection = true
  
  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"
    disk_type         = "PD_SSD"
    disk_size         = 100
    disk_autoresize   = true
    
    # Consciousness-optimized database configuration
    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements,auto_explain"
    }
    
    database_flags {
      name  = "pg_stat_statements.track"
      value = "all"
    }
    
    database_flags {
      name  = "auto_explain.log_min_duration"
      value = "1000"
    }
    
    # Backup configuration for consciousness data
    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 30
      }
    }
    
    # IP configuration for consciousness access
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.consciousness_vpc.id
      enable_private_path_for_google_cloud_services = true
    }
    
    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
      record_client_address   = true
    }
  }
}

# Redis cluster for consciousness caching
resource "google_redis_instance" "consciousness_redis" {
  name           = "${var.cluster_name}-consciousness-redis"
  tier           = "STANDARD_HA"
  memory_size_gb = 4
  region         = var.region
  
  authorized_network = google_compute_network.consciousness_vpc.id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  
  redis_version = "REDIS_6_X"
  display_name  = "Consciousness Platform Redis"
  
  labels = {
    consciousness-tier = "production"
    cache-type        = "distributed"
  }
}

# Service accounts for consciousness workloads
resource "google_service_account" "consciousness_orchestrator" {
  account_id   = "${var.cluster_name}-orchestrator"
  display_name = "Consciousness Orchestrator Service Account"
  description  = "Service account for consciousness orchestrator workloads"
}

# IAM bindings for consciousness services
resource "google_project_iam_member" "consciousness_orchestrator_roles" {
  for_each = toset([
    "roles/bigquery.dataEditor",
    "roles/cloudsql.client",
    "roles/redis.editor",
    "roles/monitoring.metricWriter",
    "roles/logging.logWriter",
    "roles/aiplatform.user"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.consciousness_orchestrator.email}"
}

# Workload Identity binding
resource "google_service_account_iam_member" "consciousness_workload_identity" {
  service_account_id = google_service_account.consciousness_orchestrator.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[consciousness-platform/consciousness-orchestrator]"
}

# Output values for consciousness platform
output "consciousness_cluster_name" {
  value       = google_container_cluster.consciousness_cluster.name
  description = "Name of the consciousness GKE cluster"
}

output "consciousness_cluster_endpoint" {
  value       = google_container_cluster.consciousness_cluster.endpoint
  description = "Endpoint of the consciousness GKE cluster"
  sensitive   = true
}

output "consciousness_database_connection_name" {
  value       = google_sql_database_instance.consciousness_db.connection_name
  description = "Connection name for the consciousness database"
}

output "consciousness_redis_host" {
  value       = google_redis_instance.consciousness_redis.host
  description = "Host for the consciousness Redis instance"
}

output "consciousness_vpc_name" {
  value       = google_compute_network.consciousness_vpc.name
  description = "Name of the consciousness VPC network"
}