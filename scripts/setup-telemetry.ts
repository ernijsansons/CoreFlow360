#!/usr/bin/env tsx

/**
 * CoreFlow360 - Telemetry Setup Script
 * 
 * Automated setup for OpenTelemetry configuration and monitoring stack
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TelemetryConfig {
  provider: 'honeycomb' | 'jaeger' | 'lightstep' | 'datadog' | 'newrelic' | 'custom';
  environment: 'development' | 'staging' | 'production';
  apiKey?: string;
  endpoint?: string;
  enablePrometheus: boolean;
  enableJaeger: boolean;
  samplingRate: number;
}

class TelemetrySetup {
  private config: TelemetryConfig;
  private envPath: string;

  constructor(config: TelemetryConfig) {
    this.config = config;
    this.envPath = path.join(process.cwd(), '.env.local');
  }

  async setup(): Promise<void> {
    console.log('🚀 Setting up CoreFlow360 OpenTelemetry integration...\n');

    try {
      await this.validateDependencies();
      await this.generateConfiguration();
      await this.setupDockerCompose();
      await this.createHealthChecks();
      await this.setupDashboards();
      await this.verifySetup();

      console.log('\n✅ Telemetry setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review the generated .env.local file');
      console.log('2. Start the monitoring stack: docker-compose -f docker-compose.telemetry.yml up -d');
      console.log('3. Restart your Next.js application');
      console.log('4. Visit /api/admin/observability/health to verify setup');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  private async validateDependencies(): Promise<void> {
    console.log('🔍 Validating dependencies...');

    const requiredPackages = [
      '@opentelemetry/sdk-node',
      '@opentelemetry/auto-instrumentations-node',
      '@opentelemetry/exporter-jaeger',
      '@opentelemetry/exporter-otlp-http',
      '@opentelemetry/exporter-prometheus',
      '@prisma/instrumentation'
    ];

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const installedPackages = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    const missingPackages = requiredPackages.filter(pkg => !installedPackages[pkg]);

    if (missingPackages.length > 0) {
      console.log('📦 Installing missing packages...');
      execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    }

    console.log('✅ Dependencies validated');
  }

  private async generateConfiguration(): Promise<void> {
    console.log('⚙️ Generating telemetry configuration...');

    const envConfig = this.generateEnvConfig();
    
    // Read existing .env.local or create new
    let existingEnv = '';
    if (fs.existsSync(this.envPath)) {
      existingEnv = fs.readFileSync(this.envPath, 'utf-8');
      // Backup existing file
      fs.writeFileSync(`${this.envPath}.backup`, existingEnv);
    }

    // Remove existing telemetry config
    const cleanedEnv = existingEnv.replace(/# OpenTelemetry Configuration[\s\S]*?# End OpenTelemetry Configuration\n/g, '');

    const newEnvContent = cleanedEnv + '\n' + envConfig;
    fs.writeFileSync(this.envPath, newEnvContent);

    console.log('✅ Configuration generated');
  }

  private generateEnvConfig(): string {
    const baseConfig = `
# OpenTelemetry Configuration
OTEL_SDK_DISABLED=false
OTEL_SERVICE_NAME=coreflow360
OTEL_SERVICE_VERSION=1.0.0
OTEL_SERVICE_NAMESPACE=coreflow360
OTEL_DEPLOYMENT_ENVIRONMENT=${this.config.environment}
CLUSTER_NAME=${this.config.environment}-cluster
DEPLOYMENT_REGION=us-east-1
INSTANCE_ID=${this.config.environment}-instance-1
`;

    let providerConfig = '';

    switch (this.config.provider) {
      case 'honeycomb':
        providerConfig = `
# Honeycomb Configuration
OTLP_ENDPOINT=https://api.honeycomb.io/v1/traces
OTLP_METRICS_ENDPOINT=https://api.honeycomb.io/v1/metrics
OTLP_API_KEY=${this.config.apiKey || 'your-honeycomb-api-key'}
HONEYCOMB_API_KEY=${this.config.apiKey || 'your-honeycomb-api-key'}
`;
        break;

      case 'jaeger':
        providerConfig = `
# Jaeger Configuration
JAEGER_ENDPOINT=${this.config.endpoint || 'http://localhost:14268/api/traces'}
JAEGER_API_KEY=${this.config.apiKey || ''}
`;
        break;

      case 'lightstep':
        providerConfig = `
# Lightstep Configuration
OTLP_ENDPOINT=https://ingest.lightstep.com:443/traces/otlp/v1
OTLP_API_KEY=${this.config.apiKey || 'your-lightstep-access-token'}
`;
        break;

      case 'datadog':
        providerConfig = `
# Datadog Configuration
OTLP_ENDPOINT=https://trace.agent.datadoghq.com/v0.4/traces
OTLP_API_KEY=${this.config.apiKey || 'your-datadog-api-key'}
`;
        break;

      case 'newrelic':
        providerConfig = `
# New Relic Configuration
OTLP_ENDPOINT=https://otlp.nr-data.net:4318/v1/traces
OTLP_API_KEY=${this.config.apiKey || 'your-newrelic-license-key'}
`;
        break;

      case 'custom':
        providerConfig = `
# Custom OTLP Configuration
OTLP_ENDPOINT=${this.config.endpoint || 'http://localhost:4318/v1/traces'}
OTLP_API_KEY=${this.config.apiKey || ''}
`;
        break;
    }

    const prometheusConfig = this.config.enablePrometheus ? `
# Prometheus Configuration
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=9090
` : '';

    const additionalConfig = `
# Sampling Configuration
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=${this.config.samplingRate}

# Advanced Configuration
OTEL_EXPORTER_OTLP_TIMEOUT=30000
OTEL_BSP_MAX_EXPORT_BATCH_SIZE=512
OTEL_BSP_EXPORT_TIMEOUT=30000

# Debug Settings
DEBUG_TELEMETRY=${this.config.environment === 'development'}
# End OpenTelemetry Configuration
`;

    return baseConfig + providerConfig + prometheusConfig + additionalConfig;
  }

  private async setupDockerCompose(): Promise<void> {
    console.log('🐳 Setting up Docker Compose for monitoring stack...');

    const dockerCompose = `version: '3.8'

services:
  jaeger:
    image: jaegertracing/all-in-one:1.49
    container_name: coreflow360-jaeger
    ports:
      - "16686:16686"  # Jaeger UI
      - "14250:14250"  # gRPC
      - "14268:14268"  # HTTP
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    restart: unless-stopped
    networks:
      - coreflow360-monitoring

  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: coreflow360-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - coreflow360-monitoring

  grafana:
    image: grafana/grafana:10.1.0
    container_name: coreflow360-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    networks:
      - coreflow360-monitoring

  redis:
    image: redis:7-alpine
    container_name: coreflow360-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - coreflow360-monitoring

volumes:
  prometheus_data:
  grafana_data:
  redis_data:

networks:
  coreflow360-monitoring:
    driver: bridge
`;

    fs.writeFileSync('docker-compose.telemetry.yml', dockerCompose);

    // Create monitoring directory structure
    const monitoringDir = 'monitoring';
    if (!fs.existsSync(monitoringDir)) {
      fs.mkdirSync(monitoringDir, { recursive: true });
    }

    // Create Prometheus configuration
    const prometheusConfig = `global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'coreflow360'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 10s

  - job_name: 'coreflow360-prometheus'
    static_configs:
      - targets: ['host.docker.internal:9090']
`;

    fs.writeFileSync(path.join(monitoringDir, 'prometheus.yml'), prometheusConfig);

    console.log('✅ Docker Compose setup completed');
  }

  private async createHealthChecks(): Promise<void> {
    console.log('🏥 Creating health check endpoints...');

    // Create a simple health check script
    const healthCheckScript = `#!/bin/bash

echo "🔍 CoreFlow360 Telemetry Health Check"
echo "====================================="

# Check if telemetry endpoint is responding
echo "Checking telemetry endpoint..."
if curl -s -f "http://localhost:3000/api/admin/observability/health" > /dev/null; then
    echo "✅ Telemetry endpoint is healthy"
else
    echo "❌ Telemetry endpoint is not responding"
fi

# Check Jaeger if enabled
if [ "$JAEGER_ENDPOINT" != "" ]; then
    echo "Checking Jaeger..."
    if curl -s -f "http://localhost:16686/api/services" > /dev/null; then
        echo "✅ Jaeger is healthy"
    else
        echo "❌ Jaeger is not responding"
    fi
fi

# Check Prometheus if enabled
if [ "$ENABLE_PROMETHEUS" = "true" ]; then
    echo "Checking Prometheus..."
    if curl -s -f "http://localhost:9090/-/healthy" > /dev/null; then
        echo "✅ Prometheus is healthy"
    else
        echo "❌ Prometheus is not responding"
    fi
fi

echo "====================================="
echo "Health check completed"
`;

    fs.writeFileSync('scripts/health-check-telemetry.sh', healthCheckScript);
    execSync('chmod +x scripts/health-check-telemetry.sh');

    console.log('✅ Health checks created');
  }

  private async setupDashboards(): Promise<void> {
    console.log('📊 Setting up monitoring dashboards...');

    // Create Grafana dashboard directories
    const grafanaDir = 'monitoring/grafana';
    fs.mkdirSync(path.join(grafanaDir, 'dashboards'), { recursive: true });
    fs.mkdirSync(path.join(grafanaDir, 'datasources'), { recursive: true });

    // Create datasources configuration
    const datasourcesConfig = `apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
`;

    fs.writeFileSync(path.join(grafanaDir, 'datasources', 'datasources.yml'), datasourcesConfig);

    // Create dashboard provisioning config
    const dashboardConfig = `apiVersion: 1

providers:
  - name: 'CoreFlow360'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
`;

    fs.writeFileSync(path.join(grafanaDir, 'dashboards', 'dashboard.yml'), dashboardConfig);

    console.log('✅ Dashboards setup completed');
  }

  private async verifySetup(): Promise<void> {
    console.log('🔍 Verifying telemetry setup...');

    // Check if all necessary files exist
    const requiredFiles = [
      '.env.local',
      'docker-compose.telemetry.yml',
      'monitoring/prometheus.yml',
      'monitoring/grafana/datasources/datasources.yml'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file ${file} was not created`);
      }
    }

    console.log('✅ Setup verification completed');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
CoreFlow360 Telemetry Setup

Usage: tsx scripts/setup-telemetry.ts [options]

Options:
  --provider <provider>     Telemetry provider (honeycomb, jaeger, lightstep, datadog, newrelic, custom)
  --environment <env>       Environment (development, staging, production)
  --api-key <key>          API key for the telemetry provider
  --endpoint <url>         Custom endpoint for OTLP traces
  --prometheus             Enable Prometheus metrics (default: true)
  --jaeger                 Enable Jaeger tracing (default: true)
  --sampling-rate <rate>   Sampling rate for traces (default: 0.1)
  --help, -h               Show this help message

Examples:
  tsx scripts/setup-telemetry.ts --provider honeycomb --api-key your-key
  tsx scripts/setup-telemetry.ts --provider jaeger --environment development
  tsx scripts/setup-telemetry.ts --provider custom --endpoint http://localhost:4318/v1/traces
`);
    process.exit(0);
  }

  const config: TelemetryConfig = {
    provider: (args[args.indexOf('--provider') + 1] as any) || 'jaeger',
    environment: (args[args.indexOf('--environment') + 1] as any) || 'development',
    apiKey: args[args.indexOf('--api-key') + 1],
    endpoint: args[args.indexOf('--endpoint') + 1],
    enablePrometheus: !args.includes('--no-prometheus'),
    enableJaeger: !args.includes('--no-jaeger'),
    samplingRate: parseFloat(args[args.indexOf('--sampling-rate') + 1]) || 0.1
  };

  const setup = new TelemetrySetup(config);
  await setup.setup();
}

if (require.main === module) {
  main().catch(console.error);
}

export { TelemetrySetup };