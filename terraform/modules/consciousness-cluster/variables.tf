variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID must not be empty."
  }
}

variable "cluster_name" {
  description = "The name of the consciousness cluster"
  type        = string
  default     = "coreflow360"
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.cluster_name))
    error_message = "Cluster name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "region" {
  description = "The Google Cloud region for the consciousness cluster"
  type        = string
  default     = "us-central1"
  validation {
    condition = contains([
      "us-central1", "us-east1", "us-west1", "us-west2",
      "europe-west1", "europe-west2", "europe-west3",
      "asia-southeast1", "asia-east1"
    ], var.region)
    error_message = "Region must be a valid Google Cloud region optimized for consciousness workloads."
  }
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "consciousness_level" {
  description = "The consciousness level for the cluster (neural, synaptic, autonomous, transcendent)"
  type        = string
  default     = "transcendent"
  validation {
    condition     = contains(["neural", "synaptic", "autonomous", "transcendent"], var.consciousness_level)
    error_message = "Consciousness level must be one of: neural, synaptic, autonomous, transcendent."
  }
}

variable "ai_providers" {
  description = "List of AI providers to enable"
  type        = list(string)
  default     = ["openai", "anthropic", "google"]
  validation {
    condition = alltrue([
      for provider in var.ai_providers : contains(["openai", "anthropic", "google", "azure"], provider)
    ])
    error_message = "AI providers must be from the supported list: openai, anthropic, google, azure."
  }
}

variable "scaling_config" {
  description = "Consciousness-aware scaling configuration"
  type = object({
    min_nodes                = number
    max_nodes                = number
    auto_scale_threshold     = number
    predictive_scaling       = bool
    consciousness_aware      = bool
    quantum_ready           = bool
  })
  default = {
    min_nodes                = 3
    max_nodes                = 100
    auto_scale_threshold     = 0.7
    predictive_scaling       = true
    consciousness_aware      = true
    quantum_ready           = true
  }
  validation {
    condition     = var.scaling_config.min_nodes >= 1 && var.scaling_config.max_nodes >= var.scaling_config.min_nodes
    error_message = "Scaling configuration must have valid min/max nodes."
  }
}

variable "database_config" {
  description = "Consciousness database configuration"
  type = object({
    tier                = string
    disk_size          = number
    backup_retention   = number
    high_availability  = bool
  })
  default = {
    tier                = "db-custom-4-16384"
    disk_size          = 100
    backup_retention   = 30
    high_availability  = true
  }
}

variable "redis_config" {
  description = "Consciousness Redis configuration"
  type = object({
    memory_size_gb = number
    tier          = string
    version       = string
  })
  default = {
    memory_size_gb = 4
    tier          = "STANDARD_HA"
    version       = "REDIS_6_X"
  }
}

variable "monitoring_config" {
  description = "Consciousness monitoring and observability configuration"
  type = object({
    enable_consciousness_metrics = bool
    enable_performance_tracking = bool
    enable_cost_optimization    = bool
    enable_quantum_readiness    = bool
    log_level                   = string
  })
  default = {
    enable_consciousness_metrics = true
    enable_performance_tracking = true
    enable_cost_optimization    = true
    enable_quantum_readiness    = true
    log_level                   = "INFO"
  }
  validation {
    condition     = contains(["DEBUG", "INFO", "WARN", "ERROR"], var.monitoring_config.log_level)
    error_message = "Log level must be one of: DEBUG, INFO, WARN, ERROR."
  }
}

variable "security_config" {
  description = "Consciousness security configuration"
  type = object({
    enable_shielded_nodes     = bool
    enable_workload_identity  = bool
    enable_binary_auth       = bool
    enable_network_policy    = bool
    enable_istio_mtls       = bool
  })
  default = {
    enable_shielded_nodes     = true
    enable_workload_identity  = true
    enable_binary_auth       = true
    enable_network_policy    = true
    enable_istio_mtls       = true
  }
}

variable "networking_config" {
  description = "Consciousness networking configuration"
  type = object({
    vpc_cidr           = string
    subnet_cidr        = string
    pod_cidr          = string
    service_cidr      = string
    enable_private_nodes = bool
  })
  default = {
    vpc_cidr           = "10.0.0.0/16"
    subnet_cidr        = "10.0.0.0/24"
    pod_cidr          = "10.1.0.0/16"
    service_cidr      = "10.2.0.0/16"
    enable_private_nodes = true
  }
}

variable "cost_optimization" {
  description = "Cost optimization settings for consciousness workloads"
  type = object({
    enable_spot_instances = bool
    enable_preemptible   = bool
    enable_auto_scaling  = bool
    enable_rightsizing   = bool
  })
  default = {
    enable_spot_instances = true
    enable_preemptible   = true
    enable_auto_scaling  = true
    enable_rightsizing   = true
  }
}

variable "labels" {
  description = "Additional labels for consciousness resources"
  type        = map(string)
  default = {
    managed-by           = "terraform"
    consciousness-tier   = "production"
    ai-optimized        = "true"
    quantum-ready       = "true"
    cost-center         = "engineering"
  }
}