/**
 * CoreFlow360 Achievement Engine
 * 
 * Consumer-grade gamification system for enterprise users
 * Makes business productivity engaging with achievements, levels, and rewards
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'productivity' | 'collaboration' | 'growth' | 'mastery' | 'leadership'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: AchievementRequirement[]
  rewards: AchievementReward[]
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  hidden: boolean
  timeLimit?: number // in milliseconds
}

export interface AchievementRequirement {
  type: 'action' | 'metric' | 'streak' | 'time' | 'collaboration'
  target: string
  value: number
  operator: 'equals' | 'greater' | 'less' | 'contains' | 'streak'
  timeWindow?: number
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'feature' | 'discount' | 'recognition'
  value: string | number
  description: string
}

export interface UserProgress {
  userId: string
  level: number
  totalPoints: number
  currentLevelPoints: number
  nextLevelPoints: number
  achievements: string[]
  badges: Badge[]
  titles: string[]
  streaks: Record<string, StreakData>
  dailyGoals: DailyGoal[]
  weeklyChallenge?: WeeklyChallenge
  leaderboardRank?: number
  stats: UserStats
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
  category: string
}

export interface StreakData {
  current: number
  longest: number
  lastActivity: Date
}

export interface DailyGoal {
  id: string
  name: string
  description: string
  target: number
  current: number
  completed: boolean
  points: number
  expiresAt: Date
}

export interface WeeklyChallenge {
  id: string
  name: string
  description: string
  objectives: ChallengeObjective[]
  startDate: Date
  endDate: Date
  participants: number
  rewards: AchievementReward[]
  userProgress: number
}

export interface ChallengeObjective {
  id: string
  name: string
  description: string
  target: number
  current: number
  completed: boolean
  points: number
}

export interface UserStats {
  tasksCompleted: number
  dealsWon: number
  meetingsAttended: number
  reportsGenerated: number
  collaborations: number
  aiInteractions: number
  timeSpent: number
  efficiencyScore: number
}

export class AchievementEngine {
  private achievements: Map<string, Achievement> = new Map()
  private userProgress: Map<string, UserProgress> = new Map()
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.initializeAchievements()
    console.log('🏆 Achievement Engine initialized with', this.achievements.size, 'achievements')
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      // Productivity Achievements
      {
        id: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '✅',
        category: 'productivity',
        rarity: 'common',
        points: 10,
        requirements: [
          { type: 'action', target: 'task_completed', value: 1, operator: 'equals' }
        ],
        rewards: [
          { type: 'points', value: 10, description: '10 productivity points' },
          { type: 'badge', value: 'starter', description: 'Starter badge' }
        ],
        hidden: false
      },

      {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 100 tasks in a single month',
        icon: '🎯',
        category: 'productivity',
        rarity: 'rare',
        points: 500,
        requirements: [
          { type: 'metric', target: 'tasks_completed', value: 100, operator: 'greater', timeWindow: 2592000000 }
        ],
        rewards: [
          { type: 'points', value: 500, description: '500 productivity points' },
          { type: 'title', value: 'Task Master', description: 'Task Master title' },
          { type: 'feature', value: 'advanced_automation', description: 'Unlock advanced automation features' }
        ],
        hidden: false
      },

      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete tasks before 9 AM for 7 consecutive days',
        icon: '🌅',
        category: 'productivity',
        rarity: 'uncommon',
        points: 250,
        requirements: [
          { type: 'streak', target: 'early_completion', value: 7, operator: 'streak' }
        ],
        rewards: [
          { type: 'points', value: 250, description: '250 productivity points' },
          { type: 'badge', value: 'early_bird', description: 'Early Bird badge' }
        ],
        hidden: false
      },

      // Collaboration Achievements
      {
        id: 'team_player',
        name: 'Team Player',
        description: 'Collaborate on 50 shared projects',
        icon: '🤝',
        category: 'collaboration',
        rarity: 'uncommon',
        points: 300,
        requirements: [
          { type: 'metric', target: 'collaborations', value: 50, operator: 'greater' }
        ],
        rewards: [
          { type: 'points', value: 300, description: '300 collaboration points' },
          { type: 'badge', value: 'team_player', description: 'Team Player badge' }
        ],
        hidden: false
      },

      {
        id: 'mentor',
        name: 'The Mentor',
        description: 'Help 25 team members complete their goals',
        icon: '👨‍🏫',
        category: 'leadership',
        rarity: 'epic',
        points: 1000,
        requirements: [
          { type: 'collaboration', target: 'helped_teammates', value: 25, operator: 'greater' }
        ],
        rewards: [
          { type: 'points', value: 1000, description: '1000 leadership points' },
          { type: 'title', value: 'The Mentor', description: 'The Mentor title' },
          { type: 'recognition', value: 'featured_member', description: 'Featured team member spotlight' }
        ],
        hidden: false
      },

      // Growth Achievements
      {
        id: 'revenue_hero',
        name: 'Revenue Hero',
        description: 'Generate $1M in new revenue',
        icon: '💰',
        category: 'growth',
        rarity: 'legendary',
        points: 5000,
        requirements: [
          { type: 'metric', target: 'revenue_generated', value: 1000000, operator: 'greater' }
        ],
        rewards: [
          { type: 'points', value: 5000, description: '5000 growth points' },
          { type: 'title', value: 'Revenue Hero', description: 'Revenue Hero title' },
          { type: 'discount', value: '50%', description: '50% discount on premium features' },
          { type: 'recognition', value: 'hall_of_fame', description: 'Hall of Fame induction' }
        ],
        hidden: false
      },

      // Mastery Achievements  
      {
        id: 'ai_whisperer',
        name: 'AI Whisperer',
        description: 'Have 1000+ successful AI interactions',
        icon: '🤖',
        category: 'mastery',
        rarity: 'rare',
        points: 750,
        requirements: [
          { type: 'metric', target: 'ai_interactions', value: 1000, operator: 'greater' }
        ],
        rewards: [
          { type: 'points', value: 750, description: '750 mastery points' },
          { type: 'badge', value: 'ai_whisperer', description: 'AI Whisperer badge' },
          { type: 'feature', value: 'custom_ai_agents', description: 'Unlock custom AI agent creation' }
        ],
        hidden: false
      },

      {
        id: 'perfectionist',
        name: 'The Perfectionist',
        description: 'Maintain 98%+ accuracy for 30 days',
        icon: '💎',
        category: 'mastery',
        rarity: 'epic',
        points: 1200,
        requirements: [
          { type: 'streak', target: 'high_accuracy', value: 30, operator: 'streak' }
        ],
        rewards: [
          { type: 'points', value: 1200, description: '1200 mastery points' },
          { type: 'title', value: 'The Perfectionist', description: 'The Perfectionist title' },
          { type: 'badge', value: 'perfectionist', description: 'Perfectionist badge' }
        ],
        hidden: false
      },

      // Hidden/Special Achievements
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete important tasks after midnight',
        icon: '🦉',
        category: 'productivity',
        rarity: 'uncommon',
        points: 200,
        requirements: [
          { type: 'action', target: 'late_night_completion', value: 10, operator: 'greater' }
        ],
        rewards: [
          { type: 'points', value: 200, description: '200 productivity points' },
          { type: 'badge', value: 'night_owl', description: 'Night Owl badge' }
        ],
        hidden: true
      },

      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 10 tasks in under 1 hour',
        icon: '⚡',
        category: 'productivity',
        rarity: 'rare',
        points: 600,
        requirements: [
          { type: 'action', target: 'rapid_completion', value: 10, operator: 'greater', timeWindow: 3600000 }
        ],
        rewards: [
          { type: 'points', value: 600, description: '600 productivity points' },
          { type: 'badge', value: 'speed_demon', description: 'Speed Demon badge' },
          { type: 'feature', value: 'turbo_mode', description: 'Unlock turbo mode interface' }
        ],
        hidden: true
      }
    ]

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement)
    })
  }

  /**
   * Track user action and check for achievement progress
   */
  async trackAction(userId: string, action: string, value: number = 1, metadata?: any): Promise<void> {
    try {
      // Get or create user progress
      let progress = this.userProgress.get(userId)
      if (!progress) {
        progress = this.initializeUserProgress(userId)
      }

      // Update relevant stats
      this.updateUserStats(progress, action, value, metadata)

      // Check all achievements for progress
      await this.checkAchievements(userId, progress, action, value, metadata)

      // Update daily goals
      await this.updateDailyGoals(progress, action, value)

      // Update weekly challenge
      if (progress.weeklyChallenge) {
        await this.updateWeeklyChallenge(progress, action, value)
      }

      // Save progress
      this.userProgress.set(userId, progress)

      // Notify listeners
      this.notifyListeners(userId, 'action_tracked', { action, value, progress })

    } catch (error) {
      console.error('Error tracking action:', error)
    }
  }

  /**
   * Get user's current progress and achievements
   */
  getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null
  }

  /**
   * Get user's unlocked achievements
   */
  getUserAchievements(userId: string): Achievement[] {
    const progress = this.userProgress.get(userId)
    if (!progress) return []

    return progress.achievements
      .map(id => this.achievements.get(id))
      .filter(achievement => achievement) as Achievement[]
  }

  /**
   * Get available achievements for user (with progress)
   */
  getAvailableAchievements(userId: string): (Achievement & { progress?: number; maxProgress?: number })[] {
    const progress = this.userProgress.get(userId)
    const available = Array.from(this.achievements.values())
      .filter(achievement => !achievement.hidden || (progress?.achievements.includes(achievement.id)))

    return available.map(achievement => {
      const achievementProgress = this.calculateAchievementProgress(userId, achievement)
      return {
        ...achievement,
        progress: achievementProgress.current,
        maxProgress: achievementProgress.max
      }
    })
  }

  /**
   * Generate daily goals for user
   */
  generateDailyGoals(userId: string): DailyGoal[] {
    const progress = this.userProgress.get(userId)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const goals: DailyGoal[] = [
      {
        id: 'daily_tasks',
        name: 'Daily Productivity',
        description: 'Complete 5 tasks today',
        target: 5,
        current: 0,
        completed: false,
        points: 50,
        expiresAt: tomorrow
      },
      {
        id: 'daily_collaboration',
        name: 'Team Connect',
        description: 'Collaborate on 2 projects today',
        target: 2,
        current: 0,
        completed: false,
        points: 30,
        expiresAt: tomorrow
      },
      {
        id: 'daily_ai',
        name: 'AI Assistant',
        description: 'Use AI features 3 times today',
        target: 3,
        current: 0,
        completed: false,
        points: 25,
        expiresAt: tomorrow
      }
    ]

    return goals
  }

  /**
   * Get leaderboard for a specific timeframe
   */
  getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' | 'alltime' = 'weekly'): Array<{
    userId: string
    username: string
    points: number
    level: number
    rank: number
    achievements: number
    avatar?: string
  }> {
    const users = Array.from(this.userProgress.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50)

    return users.map((user, index) => ({
      userId: user.userId,
      username: `User ${user.userId.slice(-6)}`, // In production, fetch from user service
      points: user.totalPoints,
      level: user.level,
      rank: index + 1,
      achievements: user.achievements.length,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`
    }))
  }

  /**
   * Subscribe to achievement events
   */
  subscribe(userId: string, eventType: string, callback: Function): () => void {
    const key = `${userId}_${eventType}`
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(callback)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) listeners.splice(index, 1)
      }
    }
  }

  private initializeUserProgress(userId: string): UserProgress {
    const dailyGoals = this.generateDailyGoals(userId)
    
    const progress: UserProgress = {
      userId,
      level: 1,
      totalPoints: 0,
      currentLevelPoints: 0,
      nextLevelPoints: 100,
      achievements: [],
      badges: [],
      titles: [],
      streaks: {},
      dailyGoals,
      stats: {
        tasksCompleted: 0,
        dealsWon: 0,
        meetingsAttended: 0,
        reportsGenerated: 0,
        collaborations: 0,
        aiInteractions: 0,
        timeSpent: 0,
        efficiencyScore: 85
      }
    }

    this.userProgress.set(userId, progress)
    return progress
  }

  private updateUserStats(progress: UserProgress, action: string, value: number, metadata?: any): void {
    switch (action) {
      case 'task_completed':
        progress.stats.tasksCompleted += value
        break
      case 'deal_won':
        progress.stats.dealsWon += value
        break
      case 'meeting_attended':
        progress.stats.meetingsAttended += value
        break
      case 'report_generated':
        progress.stats.reportsGenerated += value
        break
      case 'collaboration':
        progress.stats.collaborations += value
        break
      case 'ai_interaction':
        progress.stats.aiInteractions += value
        break
      case 'time_spent':
        progress.stats.timeSpent += value
        break
    }

    // Update efficiency score based on activity
    progress.stats.efficiencyScore = Math.min(100, progress.stats.efficiencyScore + (value * 0.1))
  }

  private async checkAchievements(
    userId: string,
    progress: UserProgress,
    action: string,
    value: number,
    metadata?: any
  ): Promise<void> {
    for (const achievement of this.achievements.values()) {
      // Skip if already unlocked
      if (progress.achievements.includes(achievement.id)) continue

      // Check if requirements are met
      const requirementsMet = achievement.requirements.every(req => 
        this.checkRequirement(progress, req, action, value, metadata)
      )

      if (requirementsMet) {
        await this.unlockAchievement(userId, progress, achievement)
      }
    }
  }

  private checkRequirement(
    progress: UserProgress,
    requirement: AchievementRequirement,
    action: string,
    value: number,
    metadata?: any
  ): boolean {
    switch (requirement.type) {
      case 'action':
        return action === requirement.target && value >= requirement.value
      
      case 'metric':
        const statValue = (progress.stats as any)[requirement.target] || 0
        return this.compareValues(statValue, requirement.value, requirement.operator)
      
      case 'streak':
        const streak = progress.streaks[requirement.target]
        return streak && streak.current >= requirement.value
      
      default:
        return false
    }
  }

  private compareValues(actual: number, target: number, operator: string): boolean {
    switch (operator) {
      case 'equals': return actual === target
      case 'greater': return actual >= target
      case 'less': return actual <= target
      default: return false
    }
  }

  private async unlockAchievement(
    userId: string,
    progress: UserProgress,
    achievement: Achievement
  ): Promise<void> {
    // Add achievement to user's unlocked list
    progress.achievements.push(achievement.id)

    // Process rewards
    for (const reward of achievement.rewards) {
      await this.grantReward(progress, reward)
    }

    // Add points and check for level up
    progress.totalPoints += achievement.points
    progress.currentLevelPoints += achievement.points
    
    await this.checkLevelUp(progress)

    // Notify achievement unlocked
    this.notifyListeners(userId, 'achievement_unlocked', { achievement, progress })

    console.log(`🏆 Achievement unlocked: ${achievement.name} for user ${userId}`)
  }

  private async grantReward(progress: UserProgress, reward: AchievementReward): Promise<void> {
    switch (reward.type) {
      case 'points':
        // Points already handled in unlockAchievement
        break
      
      case 'badge':
        progress.badges.push({
          id: reward.value as string,
          name: reward.description,
          description: reward.description,
          icon: '🏅',
          earnedAt: new Date(),
          category: 'achievement'
        })
        break
      
      case 'title':
        progress.titles.push(reward.value as string)
        break
      
      case 'feature':
        // Grant feature access (would integrate with feature flags)
        console.log(`Feature unlocked: ${reward.value}`)
        break
    }
  }

  private async checkLevelUp(progress: UserProgress): Promise<void> {
    while (progress.currentLevelPoints >= progress.nextLevelPoints) {
      progress.level++
      progress.currentLevelPoints -= progress.nextLevelPoints
      progress.nextLevelPoints = this.calculateNextLevelPoints(progress.level)

      // Notify level up
      this.notifyListeners(progress.userId, 'level_up', { 
        level: progress.level, 
        progress 
      })

      console.log(`📈 Level up! User ${progress.userId} reached level ${progress.level}`)
    }
  }

  private calculateNextLevelPoints(level: number): number {
    // Exponential scaling: 100 * 1.5^(level-1)
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }

  private calculateAchievementProgress(userId: string, achievement: Achievement): { current: number; max: number } {
    const progress = this.userProgress.get(userId)
    if (!progress) return { current: 0, max: 100 }

    // Simplified progress calculation
    const requirement = achievement.requirements[0] // Use first requirement for progress
    if (!requirement) return { current: 0, max: 100 }

    switch (requirement.type) {
      case 'metric':
        const statValue = (progress.stats as any)[requirement.target] || 0
        return { current: Math.min(statValue, requirement.value), max: requirement.value }
      
      default:
        return { current: 0, max: requirement.value }
    }
  }

  private async updateDailyGoals(progress: UserProgress, action: string, value: number): Promise<void> {
    const today = new Date()
    
    for (const goal of progress.dailyGoals) {
      if (goal.completed || goal.expiresAt < today) continue

      // Update goal progress based on action
      if (this.goalMatchesAction(goal, action)) {
        goal.current = Math.min(goal.current + value, goal.target)
        
        if (goal.current >= goal.target) {
          goal.completed = true
          progress.totalPoints += goal.points
          progress.currentLevelPoints += goal.points
          
          this.notifyListeners(progress.userId, 'daily_goal_completed', { goal, progress })
        }
      }
    }
  }

  private goalMatchesAction(goal: DailyGoal, action: string): boolean {
    switch (goal.id) {
      case 'daily_tasks': return action === 'task_completed'
      case 'daily_collaboration': return action === 'collaboration'
      case 'daily_ai': return action === 'ai_interaction'
      default: return false
    }
  }

  private async updateWeeklyChallenge(progress: UserProgress, action: string, value: number): Promise<void> {
    // Implementation for weekly challenges
    // This would update challenge objectives based on user actions
  }

  private notifyListeners(userId: string, eventType: string, data: any): void {
    const key = `${userId}_${eventType}`
    const listeners = this.listeners.get(key)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error calling achievement listener:', error)
        }
      })
    }
  }
}

export default AchievementEngine