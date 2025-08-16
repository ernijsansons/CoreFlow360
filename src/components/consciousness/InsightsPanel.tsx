'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Eye,
  Zap,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Clock,
  Target,
  BarChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Insight {
  id: string;
  type: 'pattern' | 'anomaly' | 'prediction' | 'recommendation' | 'discovery';
  category: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  modules: string[];
  generatedAt: string;
  actions?: {
    id: string;
    label: string;
    type: 'automatic' | 'manual' | 'review';
    status?: 'pending' | 'completed' | 'failed';
  }[];
}

interface InsightsSummary {
  total: number;
  last24h: number;
  last7days: number;
  byCategory: Record<string, number>;
  averageConfidence: number;
}

interface Trend {
  category: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}

const insightIcons = {
  pattern: Brain,
  anomaly: AlertTriangle,
  prediction: TrendingUp,
  recommendation: Lightbulb,
  discovery: Eye
};

const impactColors = {
  high: 'text-red-500 bg-red-500/10 border-red-500/30',
  medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-blue-500 bg-blue-500/10 border-blue-500/30'
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<InsightsSummary>({
    total: 0,
    last24h: 0,
    last7days: 0,
    byCategory: {},
    averageConfidence: 0
  });
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchInsights();
  }, [selectedFilter, selectedType]);

  const fetchInsights = async () => {
    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(selectedFilter !== 'all' && { category: selectedFilter }),
        ...(selectedType !== 'all' && { type: selectedType })
      });

      const response = await fetch(`/api/consciousness/insights?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
        setSummary(data.summary);
        setTrends(data.trends);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      toast.error('Failed to load consciousness insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
    toast.success('Insights refreshed');
  };

  const handleGenerateInsights = async () => {
    try {
      const response = await fetch('/api/consciousness/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depth: 'deep' })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setTimeout(fetchInsights, 3000);
      }
    } catch (error) {
      toast.error('Failed to generate insights');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-500';
    if (confidence >= 0.7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return MoreHorizontal;
    }
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
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-7 w-7 text-purple-500" />
            <span>Consciousness Insights</span>
          </h2>
          <p className="text-gray-400 mt-1">
            AI-generated business intelligence and patterns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateInsights}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Zap className="h-4 w-4 inline mr-2" />
            Generate
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          whileHover={{ y: -2 }}
        >
          <div className="text-2xl font-bold">{summary.total}</div>
          <div className="text-sm text-gray-400">Total Insights</div>
        </motion.div>

        <motion.div
          className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          whileHover={{ y: -2 }}
        >
          <div className="text-2xl font-bold">{summary.last24h}</div>
          <div className="text-sm text-gray-400">Last 24 Hours</div>
        </motion.div>

        <motion.div
          className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          whileHover={{ y: -2 }}
        >
          <div className="text-2xl font-bold">{(summary.averageConfidence * 100).toFixed(0)}%</div>
          <div className="text-sm text-gray-400">Avg Confidence</div>
        </motion.div>

        <motion.div
          className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          whileHover={{ y: -2 }}
        >
          <div className="text-2xl font-bold">{Object.keys(summary.byCategory).length}</div>
          <div className="text-sm text-gray-400">Categories</div>
        </motion.div>
      </div>

      {/* Trends */}
      {trends.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart className="h-5 w-5 text-green-500" />
            <span>Insight Trends</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map((trend, index) => {
              const TrendIcon = getTrendIcon(trend.direction);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <TrendIcon className={`h-4 w-4 ${
                    trend.direction === 'up' ? 'text-green-500' :
                    trend.direction === 'down' ? 'text-red-500' :
                    'text-gray-500'
                  }`} />
                  <div>
                    <div className="font-medium capitalize">{trend.category}</div>
                    <div className="text-sm text-gray-400">{trend.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter:</span>
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
        >
          <option value="all">All Categories</option>
          <option value="customer">Customer</option>
          <option value="finance">Finance</option>
          <option value="operations">Operations</option>
          <option value="business">Business</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm"
        >
          <option value="all">All Types</option>
          <option value="pattern">Patterns</option>
          <option value="anomaly">Anomalies</option>
          <option value="prediction">Predictions</option>
          <option value="recommendation">Recommendations</option>
          <option value="discovery">Discoveries</option>
        </select>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {insights.map((insight) => {
            const Icon = insightIcons[insight.type];
            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Icon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${impactColors[insight.impact]}`}>
                          {insight.impact} impact
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {insight.type}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(insight.generatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    
                    {insight.modules.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Modules:</span>
                        <div className="flex space-x-1">
                          {insight.modules.map((module, idx) => (
                            <span key={idx} className="text-xs bg-gray-800 px-2 py-1 rounded">
                              {module}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {insight.actions && insight.actions.length > 0 && (
                    <div className="flex space-x-2">
                      {insight.actions.map((action) => (
                        <button
                          key={action.id}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                            action.type === 'automatic' 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : action.type === 'review'
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {insights.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Insights Available</h3>
          <p className="text-gray-500 mb-4">
            Your consciousness is learning. Check back soon or generate new insights.
          </p>
          <button
            onClick={handleGenerateInsights}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}