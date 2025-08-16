'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calculator, 
  Package, 
  UserCheck, 
  FolderKanban,
  BarChart3,
  Lock,
  Unlock,
  Zap,
  AlertCircle,
  Sparkles,
  Network,
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Module {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  consciousnessImpact: number;
  synapticConnections: string[];
  capabilities: string[];
  status: 'active' | 'available' | 'locked' | 'coming_soon';
  icon: React.ElementType;
}

interface ModuleSelectorProps {
  onModuleToggle?: (moduleId: string, isActive: boolean) => void;
}

const moduleIcons: Record<string, React.ElementType> = {
  crm: Users,
  accounting: Calculator,
  inventory: Package,
  hr: UserCheck,
  projects: FolderKanban,
  analytics: BarChart3
};

export function ModuleSelector({ onModuleToggle }: ModuleSelectorProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [intelligenceImpact, setIntelligenceImpact] = useState({
    current: 1,
    potential: 1
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/consciousness/modules');
      if (response.ok) {
        const data = await response.json();
        
        const modulesWithIcons = data.modules.map((module: any) => ({
          ...module,
          icon: moduleIcons[module.id] || BarChart3
        }));
        
        setModules(modulesWithIcons);
        setActiveModules(data.activeModules);
        setAvailableSlots(data.availableSlots);
        setIntelligenceImpact(data.intelligenceImpact);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load consciousness modules');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = async (moduleId: string, currentlyActive: boolean) => {
    if (activating) return;

    // Check if we can activate more modules
    if (!currentlyActive && availableSlots === 0) {
      toast.error('No available module slots. Upgrade your tier for more modules.');
      return;
    }

    setActivating(moduleId);

    try {
      const response = await fetch('/api/consciousness/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          action: currentlyActive ? 'deactivate' : 'activate'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        
        // Update local state
        if (currentlyActive) {
          setActiveModules(prev => prev.filter(id => id !== moduleId));
          setAvailableSlots(prev => prev + 1);
        } else {
          setActiveModules(prev => [...prev, moduleId]);
          setAvailableSlots(prev => prev - 1);
        }

        // Update module status
        setModules(prev => prev.map(module => 
          module.id === moduleId 
            ? { ...module, isActive: !currentlyActive }
            : module
        ));

        // Callback if provided
        onModuleToggle?.(moduleId, !currentlyActive);

        // Refresh data
        setTimeout(fetchModules, 1000);
      } else {
        toast.error(data.error || 'Failed to update module');
      }
    } catch (error) {
      console.error('Module toggle error:', error);
      toast.error('Failed to update module');
    } finally {
      setActivating(null);
    }
  };

  const getModuleColor = (status: string, isActive: boolean) => {
    if (isActive) return 'from-purple-600 to-pink-600';
    
    switch (status) {
      case 'available':
        return 'from-gray-700 to-gray-800';
      case 'locked':
        return 'from-gray-800 to-gray-900';
      case 'coming_soon':
        return 'from-gray-900 to-black';
      default:
        return 'from-gray-800 to-gray-900';
    }
  };

  const getSynapticConnectionsDisplay = (connections: string[], activeModules: string[]) => {
    const activeConnections = connections.filter(conn => activeModules.includes(conn));
    return {
      active: activeConnections.length,
      total: connections.length,
      percentage: connections.length > 0 ? (activeConnections.length / connections.length) * 100 : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consciousness Modules</h2>
          <p className="text-gray-400 mt-1">
            Activate modules to expand your business consciousness
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Available Slots</div>
          <div className="text-2xl font-bold">
            {availableSlots === 999 ? '∞' : availableSlots}
          </div>
        </div>
      </div>

      {/* Intelligence Impact */}
      <motion.div 
        className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Intelligence Multiplication</h3>
              <p className="text-sm text-gray-400">{intelligenceImpact.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">
              {intelligenceImpact.current.toFixed(1)}x
            </div>
            {intelligenceImpact.potential > intelligenceImpact.current && (
              <div className="text-sm text-gray-400">
                → {intelligenceImpact.potential.toFixed(1)}x potential
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {modules.map((module) => {
            const Icon = module.icon;
            const connections = getSynapticConnectionsDisplay(
              module.synapticConnections,
              activeModules
            );
            
            return (
              <motion.div
                key={module.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${
                  getModuleColor(module.status, module.isActive)
                } p-6 transition-all duration-300 ${
                  module.status === 'locked' || module.status === 'coming_soon' 
                    ? 'opacity-60' 
                    : ''
                }`}
              >
                {/* Background Pattern */}
                {module.isActive && (
                  <div className="absolute inset-0 opacity-10">
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%']
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse'
                      }}
                      style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        module.isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-700/50'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        <span className="text-xs opacity-80 capitalize">
                          {module.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    {module.status === 'active' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                    {module.status === 'locked' && (
                      <Lock className="h-4 w-4 opacity-50" />
                    )}
                    {module.status === 'coming_soon' && (
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>
                    )}
                  </div>

                  <p className="text-sm opacity-80 mb-4">{module.description}</p>

                  {/* Synaptic Connections */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs opacity-60">Synaptic Connections</span>
                      <span className="text-xs">
                        {connections.active}/{connections.total}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${connections.percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="mb-4">
                    <div className="text-xs opacity-60 mb-2">Capabilities</div>
                    <div className="space-y-1">
                      {module.capabilities.slice(0, 2).map((capability, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Sparkles className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {module.status === 'available' || module.status === 'active' ? (
                    <button
                      onClick={() => handleModuleToggle(module.id, module.isActive)}
                      disabled={activating === module.id}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        module.isActive
                          ? 'bg-gray-800 hover:bg-gray-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } ${activating === module.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {activating === module.id ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Processing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          {module.isActive ? (
                            <>
                              <X className="h-4 w-4" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="text-center py-2 text-sm opacity-50">
                      {module.status === 'locked' ? 'Upgrade to unlock' : 'Coming soon'}
                    </div>
                  )}

                  {/* Consciousness Impact */}
                  <div className="mt-3 text-center">
                    <span className="text-xs opacity-60">Consciousness Impact</span>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < Math.ceil(module.consciousnessImpact * 10)
                              ? 'bg-purple-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info Alert */}
      {availableSlots === 0 && modules.some(m => m.status === 'available' && !m.isActive) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm">
            You've reached your module limit. Upgrade to a higher consciousness tier to activate more modules and unlock exponential intelligence growth.
          </p>
        </motion.div>
      )}
    </div>
  );
}