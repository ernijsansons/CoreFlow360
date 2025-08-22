/**
 * CoreFlow360 - Deployment Management API
 * Pipeline orchestration and deployment automation endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  pipelineOrchestrator,
  DeploymentStage,
  DeploymentStatus,
  DeploymentStrategy,
  EnvironmentType,
  PipelineConfig,
  InfrastructureConfig,
} from '@/lib/deployment/pipeline-orchestrator'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list':
        return await handleListDeployments(searchParams)
      
      case 'status':
        const executionId = searchParams.get('executionId')
        if (!executionId) {
          return NextResponse.json({ error: 'Execution ID required' }, { status: 400 })
        }
        return await handleGetDeploymentStatus(executionId)
      
      case 'pipelines':
        return await handleListPipelines()
      
      case 'infrastructure':
        return await handleInfrastructureInfo()
      
      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Deployment API GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'execute':
        return await handleExecuteDeployment(body)
      
      case 'cancel':
        return await handleCancelDeployment(body)
      
      case 'approve':
        return await handleApproveDeployment(body)
      
      case 'rollback':
        return await handleRollbackDeployment(body)
      
      case 'create_pipeline':
        return await handleCreatePipeline(body)
      
      case 'generate_infrastructure':
        return await handleGenerateInfrastructure(body)
      
      case 'deploy_infrastructure':
        return await handleDeployInfrastructure(body)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Deployment API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type } = body

    switch (type) {
      case 'pipeline_config':
        return await handleUpdatePipelineConfig(body)
      
      case 'environment_config':
        return await handleUpdateEnvironmentConfig(body)
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Deployment API PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handler functions

async function handleListDeployments(searchParams: URLSearchParams) {
  const filters = {
    pipelineId: searchParams.get('pipelineId') || undefined,
    status: searchParams.get('status') as DeploymentStatus || undefined,
    environment: searchParams.get('environment') as EnvironmentType || undefined,
    limit: parseInt(searchParams.get('limit') || '20'),
  }

  if (filters.status === 'all') delete filters.status
  if (filters.environment === 'all') delete filters.environment

  const executions = await pipelineOrchestrator.listDeployments(filters)
  
  return NextResponse.json({
    success: true,
    executions,
    total: executions.length,
  })
}

async function handleGetDeploymentStatus(executionId: string) {
  const execution = await pipelineOrchestrator.getDeploymentStatus(executionId)
  
  if (!execution) {
    return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    execution,
  })
}

async function handleListPipelines() {
  // Mock pipeline data - in production this would come from database
  const mockPipelines: PipelineConfig[] = [
    {
      id: 'pipeline_1',
      name: 'CoreFlow360 Main',
      repository: {
        url: 'https://github.com/coreflow360/main',
        branch: 'main',
        token: 'github_token_123',
        webhookSecret: 'webhook_secret_456',
      },
      stages: [
        {
          stage: DeploymentStage.PREPARATION,
          enabled: true,
          timeout: 300000,
          retries: 1,
          conditions: ['branch=main'],
          environment: { NODE_ENV: 'production' },
          commands: ['npm ci', 'npm run build'],
          artifacts: ['dist/**/*'],
        },
        {
          stage: DeploymentStage.BUILD,
          enabled: true,
          timeout: 600000,
          retries: 2,
          conditions: [],
          environment: { NODE_ENV: 'production' },
          commands: ['npm run build', 'docker build -t app:latest .'],
          artifacts: ['build/**/*', 'docker-image:latest'],
        },
        {
          stage: DeploymentStage.TEST,
          enabled: true,
          timeout: 900000,
          retries: 1,
          conditions: [],
          environment: { NODE_ENV: 'test' },
          commands: ['npm test', 'npm run test:e2e'],
          artifacts: ['test-results.xml', 'coverage/**/*'],
        },
        {
          stage: DeploymentStage.SECURITY_SCAN,
          enabled: true,
          timeout: 600000,
          retries: 1,
          conditions: [],
          environment: {},
          commands: ['npm audit', 'docker scan app:latest'],
          artifacts: ['security-report.json'],
        },
        {
          stage: DeploymentStage.STAGING,
          enabled: true,
          timeout: 1200000,
          retries: 1,
          conditions: [],
          environment: { ENVIRONMENT: 'staging' },
          commands: ['kubectl apply -f k8s/staging/', 'kubectl rollout status deployment/app'],
          artifacts: [],
        },
        {
          stage: DeploymentStage.PRODUCTION,
          enabled: true,
          timeout: 1800000,
          retries: 0,
          conditions: ['approval=required'],
          environment: { ENVIRONMENT: 'production' },
          commands: ['kubectl apply -f k8s/production/', 'kubectl rollout status deployment/app'],
          artifacts: [],
          notifications: {
            onSuccess: ['slack', 'email'],
            onFailure: ['slack', 'email', 'pager'],
          },
        },
        {
          stage: DeploymentStage.POST_DEPLOY,
          enabled: true,
          timeout: 300000,
          retries: 1,
          conditions: [],
          environment: {},
          commands: ['npm run migrate', 'npm run warmup'],
          artifacts: [],
        },
      ],
      environments: [
        {
          type: EnvironmentType.STAGING,
          name: 'Staging',
          url: 'https://staging.coreflow360.com',
          replicas: 2,
          resources: { cpu: '500m', memory: '512Mi' },
          strategy: DeploymentStrategy.ROLLING,
          autoPromote: false,
        },
        {
          type: EnvironmentType.PRODUCTION,
          name: 'Production',
          url: 'https://coreflow360.com',
          replicas: 5,
          resources: { cpu: '1000m', memory: '1Gi' },
          strategy: DeploymentStrategy.BLUE_GREEN,
          autoPromote: false,
          approvers: ['admin@coreflow360.com', 'devops@coreflow360.com'],
        },
      ],
      triggers: {
        webhook: true,
        schedule: '0 2 * * *', // Daily at 2 AM
        manual: true,
      },
      notifications: {
        slack: { webhook: 'https://hooks.slack.com/services/...', channel: '#deployments' },
        email: ['team@coreflow360.com'],
      },
      rollback: {
        autoRollback: true,
        conditions: ['error_rate>0.05', 'response_time>2000'],
        timeout: 300000,
      },
    },
    {
      id: 'pipeline_2',
      name: 'CoreFlow360 API',
      repository: {
        url: 'https://github.com/coreflow360/api',
        branch: 'main',
      },
      stages: [
        {
          stage: DeploymentStage.BUILD,
          enabled: true,
          timeout: 600000,
          retries: 2,
          conditions: [],
          environment: { NODE_ENV: 'production' },
          commands: ['npm run build:api'],
          artifacts: ['api-build/**/*'],
        },
        {
          stage: DeploymentStage.TEST,
          enabled: true,
          timeout: 600000,
          retries: 1,
          conditions: [],
          environment: { NODE_ENV: 'test' },
          commands: ['npm run test:api'],
          artifacts: ['api-test-results.xml'],
        },
        {
          stage: DeploymentStage.PRODUCTION,
          enabled: true,
          timeout: 900000,
          retries: 0,
          conditions: [],
          environment: { ENVIRONMENT: 'production' },
          commands: ['kubectl apply -f k8s/api-production/'],
          artifacts: [],
        },
      ],
      environments: [
        {
          type: EnvironmentType.PRODUCTION,
          name: 'API Production',
          url: 'https://api.coreflow360.com',
          replicas: 3,
          resources: { cpu: '750m', memory: '768Mi' },
          strategy: DeploymentStrategy.CANARY,
          autoPromote: true,
        },
      ],
      triggers: { webhook: true, manual: true },
      notifications: {
        slack: { webhook: 'https://hooks.slack.com/services/...', channel: '#api-deployments' },
      },
      rollback: {
        autoRollback: false,
        conditions: [],
        timeout: 300000,
      },
    },
  ]

  return NextResponse.json({
    success: true,
    pipelines: mockPipelines,
  })
}

async function handleExecuteDeployment(body: any) {
  const { pipelineId, branch, environment, strategy, message } = body

  if (!pipelineId) {
    return NextResponse.json({ error: 'Pipeline ID is required' }, { status: 400 })
  }

  try {
    const executionId = await pipelineOrchestrator.executeDeployment(pipelineId, {
      branch: branch || 'main',
      environment: environment || EnvironmentType.STAGING,
      strategy: strategy || DeploymentStrategy.ROLLING,
      message: message || 'Manual deployment',
      author: 'admin', // In real app, get from session
    })

    return NextResponse.json({
      success: true,
      executionId,
      message: 'Deployment started successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to start deployment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleCancelDeployment(body: any) {
  const { executionId, reason } = body

  if (!executionId) {
    return NextResponse.json({ error: 'Execution ID is required' }, { status: 400 })
  }

  try {
    const success = await pipelineOrchestrator.cancelDeployment(
      executionId,
      reason || 'Manual cancellation'
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Deployment cancelled successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel deployment or deployment not found',
      }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel deployment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleApproveDeployment(body: any) {
  const { executionId, approver, comments } = body

  if (!executionId || !approver) {
    return NextResponse.json({ 
      error: 'Execution ID and approver are required' 
    }, { status: 400 })
  }

  try {
    const success = await pipelineOrchestrator.approveDeployment(
      executionId,
      approver,
      comments
    )

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Deployment approved successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to approve deployment or deployment not found',
      }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to approve deployment',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleRollbackDeployment(body: any) {
  const { executionId, targetVersion } = body

  if (!executionId) {
    return NextResponse.json({ error: 'Execution ID is required' }, { status: 400 })
  }

  try {
    const rollbackExecutionId = await pipelineOrchestrator.rollbackDeployment(
      executionId,
      targetVersion
    )

    return NextResponse.json({
      success: true,
      rollbackExecutionId,
      message: 'Rollback initiated successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate rollback',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleCreatePipeline(body: any) {
  const { name, repository, stages, environments, triggers, notifications, rollback } = body

  if (!name || !repository) {
    return NextResponse.json({ 
      error: 'Pipeline name and repository are required' 
    }, { status: 400 })
  }

  try {
    const pipelineId = await pipelineOrchestrator.createPipeline({
      name,
      repository,
      stages: stages || [],
      environments: environments || [],
      triggers: triggers || { webhook: false, manual: true },
      notifications: notifications || {},
      rollback: rollback || { autoRollback: false, conditions: [], timeout: 300000 },
    })

    return NextResponse.json({
      success: true,
      pipelineId,
      message: 'Pipeline created successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create pipeline',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleGenerateInfrastructure(body: any) {
  const { config, format } = body

  if (!config) {
    return NextResponse.json({ error: 'Infrastructure config is required' }, { status: 400 })
  }

  try {
    const template = pipelineOrchestrator.generateInfrastructureTemplate(
      config as InfrastructureConfig,
      format || 'terraform'
    )

    return NextResponse.json({
      success: true,
      template,
      format: format || 'terraform',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate infrastructure template',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleDeployInfrastructure(body: any) {
  const { config, environment } = body

  if (!config || !environment) {
    return NextResponse.json({ 
      error: 'Infrastructure config and environment are required' 
    }, { status: 400 })
  }

  try {
    const result = await pipelineOrchestrator.deployInfrastructure(
      config as InfrastructureConfig,
      environment as EnvironmentType
    )

    return NextResponse.json({
      success: true,
      ...result,
      message: 'Infrastructure deployment initiated successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to deploy infrastructure',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function handleInfrastructureInfo() {
  // Mock infrastructure information
  const infrastructureInfo = {
    providers: [
      { id: 'aws', name: 'Amazon Web Services', available: true },
      { id: 'gcp', name: 'Google Cloud Platform', available: true },
      { id: 'azure', name: 'Microsoft Azure', available: true },
      { id: 'kubernetes', name: 'Kubernetes', available: true },
      { id: 'docker', name: 'Docker', available: true },
    ],
    templates: [
      { id: 'terraform', name: 'Terraform', extension: '.tf', description: 'Infrastructure as Code with Terraform' },
      { id: 'cloudformation', name: 'CloudFormation', extension: '.yaml', description: 'AWS CloudFormation templates' },
      { id: 'kubernetes', name: 'Kubernetes', extension: '.yaml', description: 'Kubernetes manifests and Helm charts' },
    ],
    defaultConfig: {
      provider: 'kubernetes',
      region: 'us-east-1',
      resources: {
        compute: {
          type: 't3.medium',
          count: 3,
          autoScaling: {
            min: 2,
            max: 10,
            cpu: 70,
            memory: 80,
          },
        },
        storage: {
          type: 'gp3',
          size: 100,
          encryption: true,
        },
        network: {
          vpc: 'vpc-default',
          subnets: ['subnet-1', 'subnet-2'],
          securityGroups: ['sg-web', 'sg-app'],
          loadBalancer: true,
        },
        database: {
          engine: 'postgresql',
          version: '15.4',
          instanceClass: 'db.t3.micro',
          storage: 20,
          backups: {
            enabled: true,
            retention: 7,
          },
        },
      },
      monitoring: {
        enabled: true,
        alerting: true,
        logs: {
          retention: 30,
          level: 'info',
        },
      },
      security: {
        encryption: true,
        certificates: [],
        firewall: {
          rules: [
            { port: 80, protocol: 'tcp', source: '0.0.0.0/0' },
            { port: 443, protocol: 'tcp', source: '0.0.0.0/0' },
          ],
        },
      },
    },
  }

  return NextResponse.json({
    success: true,
    ...infrastructureInfo,
  })
}

async function handleUpdatePipelineConfig(body: any) {
  const { pipelineId, config } = body

  if (!pipelineId || !config) {
    return NextResponse.json({ 
      error: 'Pipeline ID and config are required' 
    }, { status: 400 })
  }

  // Mock update - in production this would update the database
  return NextResponse.json({
    success: true,
    message: 'Pipeline configuration updated successfully',
    pipelineId,
  })
}

async function handleUpdateEnvironmentConfig(body: any) {
  const { environment, config } = body

  if (!environment || !config) {
    return NextResponse.json({ 
      error: 'Environment and config are required' 
    }, { status: 400 })
  }

  // Mock update - in production this would update environment settings
  return NextResponse.json({
    success: true,
    message: 'Environment configuration updated successfully',
    environment,
  })
}