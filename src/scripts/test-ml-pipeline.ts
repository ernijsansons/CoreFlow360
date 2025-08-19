/**
 * CoreFlow360 - ML Pipeline Test Script
 * Comprehensive testing of the ML model retraining pipeline
 */

import {
  ModelRetrainingPipeline,
  type ModelConfig,
  type TrainingData,
} from '@/lib/ml/model-retraining-pipeline'

interface TestResult {
  testName: string
  passed: boolean
  details: string
  metrics?: unknown
  duration?: number
}

class MLPipelineTestSuite {
  private results: TestResult[] = []
  private pipeline: ModelRetrainingPipeline | null = null

  log(_message: string) {}

  addResult(
    testName: string,
    passed: boolean,
    details: string,
    metrics?: unknown,
    duration?: number
  ) {
    this.results.push({ testName, passed, details, metrics, duration })
    const status = passed ? '✅ PASS' : '❌ FAIL'
    this.log(`${status}: ${testName} - ${details}${duration ? ` (${duration}ms)` : ''}`)
  }

  async runAllTests() {
    this.log('Starting ML Pipeline Test Suite...')

    await this.testPipelineInitialization()
    await this.testModelRegistration()
    await this.testDataLoading()
    await this.testTrainingExecution()
    await this.testDriftDetection()
    await this.testPerformanceMonitoring()
    await this.testHyperparameterOptimization()
    await this.testPipelineStatus()

    this.generateReport()
  }

  async testPipelineInitialization() {
    this.log('Testing pipeline initialization...')

    const startTime = Date.now()
    try {
      this.pipeline = new ModelRetrainingPipeline()

      // Check if default models are loaded
      const models = this.pipeline.getAllModels()
      const hasDefaultModels = models.length > 0

      // Check if pipeline status is available
      const status = this.pipeline.getPipelineStatus()
      const hasValidStatus = status && typeof status.models === 'number'

      const duration = Date.now() - startTime
      const success = hasDefaultModels && hasValidStatus

      this.addResult(
        'Pipeline Initialization',
        success,
        `Initialized with ${models.length} default models`,
        {
          defaultModels: models.length,
          status: status,
          hasScheduler: true,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Pipeline Initialization',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testModelRegistration() {
    this.log('Testing model registration...')

    if (!this.pipeline) {
      this.addResult('Model Registration', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      const testModel: ModelConfig = {
        id: 'test_model_registration',
        name: 'Test Model for Registration',
        type: 'classification',
        algorithm: 'random_forest',
        features: ['feature1', 'feature2', 'feature3'],
        target: 'target_variable',
        hyperparameters: { n_estimators: 50, max_depth: 5 },
        performance_threshold: 0.85,
        retrain_frequency: 'weekly',
        data_source: 'test_data',
        version: '1.0.0',
      }

      const beforeCount = this.pipeline.getAllModels().length
      this.pipeline.registerModel(testModel)
      const afterCount = this.pipeline.getAllModels().length

      const registered = afterCount > beforeCount
      const retrievedModel = this.pipeline.getModelConfig(testModel.id)
      const correctlyStored = retrievedModel?.name === testModel.name

      const duration = Date.now() - startTime

      this.addResult(
        'Model Registration',
        registered && correctlyStored,
        `Model registered successfully. Count: ${beforeCount} → ${afterCount}`,
        {
          modelsBefore: beforeCount,
          modelsAfter: afterCount,
          modelId: testModel.id,
          correctlyStored,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Model Registration',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testDataLoading() {
    this.log('Testing data loading...')

    if (!this.pipeline) {
      this.addResult('Data Loading', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      // Use private method through type assertion for testing
      const loadMethod = (this.pipeline as unknown).loadTrainingData
      if (typeof loadMethod !== 'function') {
        this.addResult('Data Loading', false, 'Load method not accessible')
        return
      }

      const trainingData: TrainingData = await loadMethod.call(this.pipeline, 'test_data_source', [
        'feature1',
        'feature2',
        'feature3',
      ])

      const hasFeatures = trainingData.features && trainingData.features.length > 0
      const hasLabels = trainingData.labels && trainingData.labels.length > 0
      const hasMetadata = trainingData.metadata && trainingData.metadata.source
      const correctDimensions = trainingData.features.every((row) => row.length === 3)

      const duration = Date.now() - startTime

      this.addResult(
        'Data Loading',
        hasFeatures && hasLabels && hasMetadata && correctDimensions,
        `Loaded ${trainingData.features.length} samples with ${trainingData.features[0]?.length || 0} features`,
        {
          samples: trainingData.features.length,
          features: trainingData.features[0]?.length || 0,
          hasLabels,
          hasMetadata,
          correctDimensions,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Data Loading',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testTrainingExecution() {
    this.log('Testing training execution...')

    if (!this.pipeline) {
      this.addResult('Training Execution', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      // Get a default model for testing
      const models = this.pipeline.getAllModels()
      if (models.length === 0) {
        this.addResult('Training Execution', false, 'No models available for testing')
        return
      }

      const testModel = models[0]
      const jobId = await this.pipeline.startRetraining(testModel.id, 'manual', false)

      // Wait for job to start
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const job = this.pipeline.getTrainingJob(jobId)
      const jobStarted = job && job.status !== 'pending'

      // Wait for job to potentially complete (or timeout)
      let jobCompleted = false
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts && !jobCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const updatedJob = this.pipeline.getTrainingJob(jobId)
        jobCompleted = updatedJob?.status === 'completed' || updatedJob?.status === 'failed'
        attempts++
      }

      const finalJob = this.pipeline.getTrainingJob(jobId)
      const duration = Date.now() - startTime

      this.addResult(
        'Training Execution',
        jobStarted && jobId.length > 0,
        `Job ${jobId} ${jobStarted ? 'started' : 'failed to start'}. Status: ${finalJob?.status || 'unknown'}`,
        {
          jobId,
          jobStarted,
          finalStatus: finalJob?.status,
          dataPointsUsed: finalJob?.data_points_used || 0,
          improvement: finalJob?.improvement_achieved || 0,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Training Execution',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testDriftDetection() {
    this.log('Testing drift detection...')

    if (!this.pipeline) {
      this.addResult('Drift Detection', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      const models = this.pipeline.getAllModels()
      if (models.length === 0) {
        this.addResult('Drift Detection', false, 'No models available for testing')
        return
      }

      const testModel = models[0]
      const hasDrift = await this.pipeline.checkDataDrift(testModel.id)

      // Drift detection should return a boolean
      const validResult = typeof hasDrift === 'boolean'

      const duration = Date.now() - startTime

      this.addResult(
        'Drift Detection',
        validResult,
        `Drift check completed for ${testModel.id}. Drift detected: ${hasDrift}`,
        {
          modelId: testModel.id,
          hasDrift,
          resultType: typeof hasDrift,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Drift Detection',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testPerformanceMonitoring() {
    this.log('Testing performance monitoring...')

    if (!this.pipeline) {
      this.addResult('Performance Monitoring', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      const models = this.pipeline.getAllModels()
      if (models.length === 0) {
        this.addResult('Performance Monitoring', false, 'No models available for testing')
        return
      }

      const testModel = models[0]
      await this.pipeline.monitorPerformance(testModel.id)

      // Performance monitoring should complete without error
      const duration = Date.now() - startTime

      this.addResult(
        'Performance Monitoring',
        true,
        `Performance monitoring completed for ${testModel.id}`,
        {
          modelId: testModel.id,
          threshold: testModel.performance_threshold,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Performance Monitoring',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testHyperparameterOptimization() {
    this.log('Testing hyperparameter optimization...')

    if (!this.pipeline) {
      this.addResult('Hyperparameter Optimization', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      // Access the optimizer through type assertion for testing
      const optimizer = (this.pipeline as unknown).optimizer
      if (!optimizer) {
        this.addResult('Hyperparameter Optimization', false, 'Optimizer not accessible')
        return
      }

      // Create mock training data
      const mockTrainingData: TrainingData = {
        features: Array(100)
          .fill(0)
          .map(() => [Math.random(), Math.random(), Math.random()]),
        labels: Array(100)
          .fill(0)
          .map(() => (Math.random() > 0.5 ? 1 : 0)),
        metadata: {
          timestamp: new Date(),
          source: 'test',
          quality_score: 1.0,
        },
      }

      const mockValidationData: TrainingData = {
        features: Array(20)
          .fill(0)
          .map(() => [Math.random(), Math.random(), Math.random()]),
        labels: Array(20)
          .fill(0)
          .map(() => (Math.random() > 0.5 ? 1 : 0)),
        metadata: {
          timestamp: new Date(),
          source: 'test',
          quality_score: 1.0,
        },
      }

      const result = await optimizer.optimize(
        'random_forest',
        mockTrainingData,
        mockValidationData,
        3 // Small number of iterations for testing
      )

      const hasParams = result.bestParams && Object.keys(result.bestParams).length > 0
      const hasScore = typeof result.bestScore === 'number' && result.bestScore >= 0

      const duration = Date.now() - startTime

      this.addResult(
        'Hyperparameter Optimization',
        hasParams && hasScore,
        `Optimization completed. Best score: ${result.bestScore.toFixed(3)}`,
        {
          bestParams: result.bestParams,
          bestScore: result.bestScore,
          hasValidParams: hasParams,
          hasValidScore: hasScore,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Hyperparameter Optimization',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async testPipelineStatus() {
    this.log('Testing pipeline status and metrics...')

    if (!this.pipeline) {
      this.addResult('Pipeline Status', false, 'Pipeline not initialized')
      return
    }

    const startTime = Date.now()
    try {
      const status = this.pipeline.getPipelineStatus()
      const allModels = this.pipeline.getAllModels()
      const recentJobs = this.pipeline.getRecentJobs(5)

      const hasValidStatus = status && typeof status.models === 'number'
      const hasModels = allModels.length > 0
      const canRetrieveJobs = Array.isArray(recentJobs)

      const duration = Date.now() - startTime

      this.addResult(
        'Pipeline Status',
        hasValidStatus && hasModels && canRetrieveJobs,
        `Status: ${status.models} models, ${status.activeJobs} active jobs, ${status.completedJobs} completed`,
        {
          status,
          modelsCount: allModels.length,
          jobsCount: recentJobs.length,
          avgImprovement: status.avgImprovement,
        },
        duration
      )
    } catch (error) {
      this.addResult(
        'Pipeline Status',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60))
    this.log('ML PIPELINE TEST REPORT')
    this.log('='.repeat(60))

    const totalTests = this.results.length
    const passedTests = this.results.filter((r) => r.passed).length
    const failedTests = totalTests - passedTests
    const successRate = ((passedTests / totalTests) * 100).toFixed(1)
    const totalDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0)

    this.log(`Total Tests: ${totalTests}`)
    this.log(`Passed: ${passedTests}`)
    this.log(`Failed: ${failedTests}`)
    this.log(`Success Rate: ${successRate}%`)
    this.log(`Total Duration: ${totalDuration}ms`)

    if (this.pipeline) {
      const finalStatus = this.pipeline.getPipelineStatus()
      this.log(`\nFinal Pipeline State:`)
      this.log(`- Models: ${finalStatus.models}`)
      this.log(`- Active Jobs: ${finalStatus.activeJobs}`)
      this.log(`- Completed Jobs: ${finalStatus.completedJobs}`)
      this.log(`- Failed Jobs: ${finalStatus.failedJobs}`)
      this.log(`- Average Improvement: ${finalStatus.avgImprovement.toFixed(2)}%`)
    }

    this.log('\nDETAILED RESULTS:')
    this.log('-'.repeat(40))

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌'
      this.log(`${index + 1}. ${status} ${result.testName}`)
      this.log(`   ${result.details}`)
      if (result.duration) {
        this.log(`   Duration: ${result.duration}ms`)
      }
      if (result.metrics) {
        this.log(`   Metrics: ${JSON.stringify(result.metrics, null, 2)}`)
      }
      this.log('')
    })

    if (failedTests > 0) {
      this.log('⚠️  SOME TESTS FAILED - Please review the ML pipeline implementation')
    } else {
      this.log('🎉 ALL TESTS PASSED - ML retraining pipeline is working correctly!')
    }

    this.log('='.repeat(60))
  }
}

// Run the test suite
async function runMLPipelineTests() {
  const testSuite = new MLPipelineTestSuite()
  await testSuite.runAllTests()
}

// Export for use in other contexts
export { MLPipelineTestSuite, runMLPipelineTests }

// Run if executed directly
if (require.main === module) {
  runMLPipelineTests().catch(console.error)
}
