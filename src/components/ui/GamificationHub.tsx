'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Users,
  Clock,
  Flame,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Calendar,
  BarChart3
} from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

interface UserProgress {
  level: number
  totalPoints: number
  currentLevelPoints: number
  nextLevelPoints: number
  achievements: Achievement[]
  streak: number
  rank: number
  dailyGoals: DailyGoal[]
}

interface DailyGoal {
  id: string
  name: string
  description: string
  target: number
  current: number
  completed: boolean
  points: number
}

interface LeaderboardEntry {
  userId: string
  username: string
  points: number
  level: number
  rank: number
  avatar?: string
  achievements: number
}

export default function GamificationHub() {
  const [view, setView] = useState<'overview' | 'achievements' | 'leaderboard' | 'goals'>('overview')
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showLevelUp, setShowLevelUp] = useState(false)

  const mockUserProgress: UserProgress = {
    level: 15,
    totalPoints: 8750,
    currentLevelPoints: 350,
    nextLevelPoints: 500,
    achievements: [],
    streak: 12,
    rank: 3,
    dailyGoals: [
      {
        id: 'daily_tasks',
        name: 'Daily Productivity',
        description: 'Complete 5 tasks today',
        target: 5,
        current: 3,
        completed: false,
        points: 50
      },
      {
        id: 'daily_collaboration',
        name: 'Team Connect',
        description: 'Collaborate on 2 projects today',
        target: 2,
        current: 2,
        completed: true,
        points: 30
      },
      {
        id: 'daily_ai',
        name: 'AI Assistant',
        description: 'Use AI features 3 times today',
        target: 3,
        current: 1,
        completed: false,
        points: 25
      }
    ]
  }

  const mockAchievements: Achievement[] = [
    {
      id: 'task_master',
      name: 'Task Master',
      description: 'Complete 100 tasks in a single month',
      icon: '🎯',
      category: 'Productivity',
      rarity: 'rare',
      points: 500,
      progress: 87,
      maxProgress: 100
    },
    {
      id: 'team_player',
      name: 'Team Player',
      description: 'Collaborate on 50 shared projects',
      icon: '🤝',
      category: 'Collaboration',
      rarity: 'uncommon',
      points: 300,
      unlockedAt: new Date('2024-01-08'),
      progress: 50,
      maxProgress: 50
    },
    {
      id: 'revenue_hero',
      name: 'Revenue Hero',
      description: 'Generate $1M in new revenue',
      icon: '💰',
      category: 'Growth',
      rarity: 'legendary',
      points: 5000,
      progress: 750000,
      maxProgress: 1000000
    },
    {
      id: 'ai_whisperer',
      name: 'AI Whisperer',
      description: 'Have 1000+ successful AI interactions',
      icon: '🤖',
      category: 'Mastery',
      rarity: 'rare',
      points: 750,
      unlockedAt: new Date('2024-01-05'),
      progress: 1000,
      maxProgress: 1000
    }
  ]

  const mockLeaderboard: LeaderboardEntry[] = [
    { userId: '1', username: 'Sarah Chen', points: 12450, level: 22, rank: 1, achievements: 28, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { userId: '2', username: 'Marcus Johnson', points: 9870, level: 18, rank: 2, achievements: 21, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus' },
    { userId: '3', username: 'You', points: 8750, level: 15, rank: 3, achievements: 19, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
    { userId: '4', username: 'Lisa Rodriguez', points: 8200, level: 14, rank: 4, achievements: 17, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa' },
    { userId: '5', username: 'David Kim', points: 7850, level: 13, rank: 5, achievements: 16, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' }
  ]

  useEffect(() => {
    setUserProgress(mockUserProgress)
    setRecentAchievements(mockAchievements.filter(a => a.unlockedAt).slice(0, 3))
    setLeaderboard(mockLeaderboard)
  }, [])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'uncommon': return 'text-green-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600/20 border-gray-500/30'
      case 'uncommon': return 'bg-green-600/20 border-green-500/30'
      case 'rare': return 'bg-blue-600/20 border-blue-500/30'
      case 'epic': return 'bg-purple-600/20 border-purple-500/30'
      case 'legendary': return 'bg-yellow-600/20 border-yellow-500/30'
      default: return 'bg-gray-600/20 border-gray-500/30'
    }
  }

  if (!userProgress) return null

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/50 rounded-3xl p-12 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-4xl font-bold text-yellow-400 mb-2">LEVEL UP!</h2>
              <p className="text-xl text-white mb-4">You reached Level {userProgress.level}!</p>
              <div className="text-gray-300">
                New features and rewards unlocked!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 text-4xl opacity-20"
          >
            ⭐
          </motion.div>
          <Crown className="w-8 h-8 text-violet-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">Level {userProgress.level}</div>
          <div className="text-violet-300 text-sm">Elite Member</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userProgress.totalPoints.toLocaleString()}</div>
          <div className="text-yellow-300 text-sm">Total Points</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <Flame className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userProgress.streak}</div>
          <div className="text-red-300 text-sm">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">#{userProgress.rank}</div>
          <div className="text-green-300 text-sm">Global Rank</div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Users },
          { id: 'goals', label: 'Daily Goals', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl transition-all ${
                view === tab.id
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="hidden md:block">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Level Progress */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Level Progress</h3>
                <div className="text-violet-400">
                  {userProgress.currentLevelPoints}/{userProgress.nextLevelPoints} XP
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(userProgress.currentLevelPoints / userProgress.nextLevelPoints) * 100}%` 
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ width: '100px' }}
                    />
                  </motion.div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-medium">
                  {Math.round((userProgress.currentLevelPoints / userProgress.nextLevelPoints) * 100)}%
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Achievements</h3>
                <button 
                  onClick={() => setView('achievements')}
                  className="text-violet-400 hover:text-violet-300 flex items-center"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${getRarityBg(achievement.rarity)} rounded-xl p-4 text-center relative overflow-hidden`}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-3xl mb-2"
                    >
                      {achievement.icon}
                    </motion.div>
                    <h4 className={`font-semibold ${getRarityColor(achievement.rarity)} mb-1`}>
                      {achievement.name}
                    </h4>
                    <p className="text-gray-300 text-xs mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-center text-yellow-400">
                      <Star className="w-4 h-4 mr-1" />
                      {achievement.points}
                    </div>
                    
                    {achievement.unlockedAt && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Daily Goals Preview */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Daily Goals</h3>
                <button 
                  onClick={() => setView('goals')}
                  className="text-violet-400 hover:text-violet-300 flex items-center"
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>

              <div className="space-y-3">
                {userProgress.dailyGoals.slice(0, 2).map((goal) => (
                  <motion.div
                    key={goal.id}
                    className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl"
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                        goal.completed ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {goal.completed ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Target className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{goal.name}</div>
                        <div className="text-gray-400 text-sm">{goal.current}/{goal.target}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 mr-1" />
                      {goal.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">All Achievements</h3>
              
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mockAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${getRarityBg(achievement.rarity)} rounded-xl p-6 relative overflow-hidden`}
                  >
                    <div className="text-4xl mb-4">{achievement.icon}</div>
                    
                    <h4 className={`font-bold ${getRarityColor(achievement.rarity)} mb-2`}>
                      {achievement.name}
                    </h4>
                    <p className="text-gray-300 text-sm mb-4">{achievement.description}</p>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">Progress</span>
                          <span className="text-white text-sm">
                            {achievement.progress.toLocaleString()}/{achievement.maxProgress.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              achievement.unlockedAt ? 'bg-green-500' : 'bg-violet-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        {achievement.points}
                      </div>
                      
                      {achievement.unlockedAt ? (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">Unlocked</span>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">Locked</div>
                      )}
                    </div>
                    
                    {achievement.unlockedAt && (
                      <div className="absolute top-3 right-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Global Leaderboard</h3>
              
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center p-4 rounded-xl ${
                      entry.username === 'You' 
                        ? 'bg-violet-600/20 border border-violet-500/30' 
                        : 'bg-gray-700/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 ${
                      entry.rank === 1 ? 'bg-yellow-500 text-black' :
                      entry.rank === 2 ? 'bg-gray-400 text-black' :
                      entry.rank === 3 ? 'bg-orange-500 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {entry.rank <= 3 ? (
                        entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        entry.rank
                      )}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                      <img 
                        src={entry.avatar} 
                        alt={entry.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-semibold ${
                            entry.username === 'You' ? 'text-violet-300' : 'text-white'
                          }`}>
                            {entry.username}
                          </div>
                          <div className="text-gray-400 text-sm">Level {entry.level}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {entry.points.toLocaleString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {entry.achievements} achievements
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Daily Goals</h3>
              
              <div className="space-y-4">
                {userProgress.dailyGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-xl ${
                      goal.completed 
                        ? 'bg-green-600/20 border border-green-500/30' 
                        : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                          goal.completed ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {goal.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Target className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{goal.name}</h4>
                          <p className="text-gray-400 text-sm">{goal.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-yellow-400 mb-2">
                          <Star className="w-4 h-4 mr-1" />
                          {goal.points}
                        </div>
                        {goal.completed && (
                          <div className="text-green-400 text-sm font-medium">
                            Completed!
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-white text-sm">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className={`h-full rounded-full ${
                            goal.completed ? 'bg-green-500' : 'bg-violet-500'
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}