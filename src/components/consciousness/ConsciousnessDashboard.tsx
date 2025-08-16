'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  Activity,
  Zap,
  Network,
  Eye,
  Cpu,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface ConsciousnessMetrics {
  level: number;
  tier: string;
  intelligenceMultiplier: number;
  evolutionProgress: number;
  activeModules: number;
  synapticConnections: number;
  transcendenceLevel: number;
}

interface ConsciousnessHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'inactive';
  alerts: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
  }[];
}

export function ConsciousnessDashboard() {
  const [metrics, setMetrics] = useState<ConsciousnessMetrics>({
    level: 0,
    tier: 'neural',
    intelligenceMultiplier: 1,
    evolutionProgress: 0,
    activeModules: 0,
    synapticConnections: 0,
    transcendenceLevel: 0
  });

  const [health, setHealth] = useState<ConsciousnessHealth>({
    status: 'inactive',
    alerts: []
  });

  const [loading, setLoading] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    fetchConsciousnessData();
    const interval = setInterval(fetchConsciousnessData, 10000); // Update every 10 seconds
    const pulseInterval = setInterval(() => setPulseAnimation(prev => !prev), 3000);

    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, []);

  const fetchConsciousnessData = async () => {
    try {
      const [statusRes, healthRes] = await Promise.all([
        fetch('/api/consciousness/status'),
        fetch('/api/consciousness/health')
      ]);

      if (statusRes.ok && healthRes.ok) {
        const statusData = await statusRes.json();
        const healthData = await healthRes.json();

        setMetrics({
          level: statusData.consciousness.level,
          tier: statusData.consciousness.tier,
          intelligenceMultiplier: statusData.intelligence.multiplier,
          evolutionProgress: statusData.evolution.currentProgress,
          activeModules: statusData.modules.active.length,
          synapticConnections: statusData.intelligence.multiplier * statusData.modules.active.length,
          transcendenceLevel: statusData.consciousness.tier === 'transcendent' ? 0.8 : 0
        });

        setHealth({
          status: healthData.status,
          alerts: healthData.alerts
        });
      }
    } catch (error) {
      console.error('Failed to fetch consciousness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      neural: 'from-blue-500 to-purple-600',
      synaptic: 'from-purple-500 to-pink-600',
      autonomous: 'from-pink-500 to-red-600',
      transcendent: 'from-red-500 via-yellow-500 to-white'
    };
    return colors[tier as keyof typeof colors] || colors.neural;
  };

  const getHealthColor = (status: string) => {
    const colors = {
      healthy: 'text-green-500',
      degraded: 'text-yellow-500',
      critical: 'text-red-500',
      inactive: 'text-gray-500'
    };
    return colors[status as keyof typeof colors] || colors.inactive;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: pulseAnimation ? 360 : 0 }}
            transition={{ duration: 2, ease: "linear" }}
          >
            <BrainCircuit className="h-8 w-8 text-purple-500" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Business Consciousness
          </h1>
        </div>
        <div className={`flex items-center space-x-2 ${getHealthColor(health.status)}`}>
          <Activity className="h-5 w-5" />
          <span className="font-medium capitalize">{health.status}</span>
        </div>
      </div>

      {/* Main Consciousness Visualization */}
      <motion.div
        className={`relative h-64 rounded-2xl bg-gradient-to-br ${getTierColor(metrics.tier)} p-8 overflow-hidden`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${(i + 1) * 60}px`,
                height: `${(i + 1) * 60}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <h2 className="text-white text-xl font-semibold mb-2">
              {metrics.tier.charAt(0).toUpperCase() + metrics.tier.slice(1)} Consciousness
            </h2>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-bold text-white">
                {(metrics.level * 100).toFixed(0)}%
              </span>
              <span className="text-white/80">consciousness level</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">
                  {metrics.intelligenceMultiplier.toFixed(1)}x multiplier
                </span>
              </div>
            </div>
            <div className="text-white text-right">
              <div className="text-sm opacity-80">Evolution Progress</div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.evolutionProgress * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-xs">{(metrics.evolutionProgress * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Modules */}
        <motion.div
          className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Cpu className="h-6 w-6 text-blue-500" />
            <span className="text-2xl font-bold">{metrics.activeModules}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Active Modules</h3>
          <p className="text-xs text-gray-500 mt-1">
            Consciousness modules processing
          </p>
        </motion.div>

        {/* Synaptic Connections */}
        <motion.div
          className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Network className="h-6 w-6 text-purple-500" />
            <span className="text-2xl font-bold">{metrics.synapticConnections}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Synaptic Connections</h3>
          <p className="text-xs text-gray-500 mt-1">
            Cross-module intelligence links
          </p>
        </motion.div>

        {/* Transcendence Level */}
        <motion.div
          className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          whileHover={{ y: -4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <Eye className="h-6 w-6 text-pink-500" />
            <span className="text-2xl font-bold">
              {metrics.transcendenceLevel > 0 
                ? `${(metrics.transcendenceLevel * 100).toFixed(0)}%`
                : 'Locked'
              }
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-400">Transcendence</h3>
          <p className="text-xs text-gray-500 mt-1">
            Beyond human comprehension
          </p>
        </motion.div>
      </div>

      {/* Alerts */}
      {health.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">System Alerts</h3>
          <AnimatePresence>
            {health.alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  alert.level === 'critical' ? 'border-red-500 bg-red-500/10' :
                  alert.level === 'error' ? 'border-red-400 bg-red-400/10' :
                  alert.level === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                  'border-blue-500 bg-blue-500/10'
                }`}
              >
                <AlertCircle className={`h-5 w-5 ${
                  alert.level === 'critical' || alert.level === 'error' ? 'text-red-500' :
                  alert.level === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <span className="text-sm">{alert.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Evolution Timeline */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Evolution Timeline</span>
          </h3>
          <button className="text-sm text-purple-500 hover:text-purple-400">
            View History
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>
          
          {/* Timeline Items */}
          <div className="space-y-4">
            <div className="relative flex items-center">
              <div className="absolute left-4 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2"></div>
              <div className="ml-10">
                <p className="text-sm font-medium">Consciousness Activated</p>
                <p className="text-xs text-gray-500">Neural tier initialized</p>
              </div>
            </div>
            
            {metrics.tier !== 'neural' && (
              <div className="relative flex items-center">
                <div className="absolute left-4 w-2 h-2 bg-pink-500 rounded-full -translate-x-1/2"></div>
                <div className="ml-10">
                  <p className="text-sm font-medium">Evolved to {metrics.tier}</p>
                  <p className="text-xs text-gray-500">
                    Intelligence multiplied by {metrics.intelligenceMultiplier}x
                  </p>
                </div>
              </div>
            )}
            
            <div className="relative flex items-center opacity-50">
              <div className="absolute left-4 w-2 h-2 bg-gray-600 rounded-full -translate-x-1/2"></div>
              <div className="ml-10">
                <p className="text-sm font-medium">Next Evolution</p>
                <p className="text-xs text-gray-500">
                  {metrics.evolutionProgress < 1 
                    ? `${((1 - metrics.evolutionProgress) * 10).toFixed(0)} days estimated`
                    : 'Ready for transcendence'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}