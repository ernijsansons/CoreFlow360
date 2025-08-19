import { vi } from 'vitest'

// Mock pipeline implementation
const mockPipeline = {
  get: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  setex: vi.fn().mockReturnThis(),
  del: vi.fn().mockReturnThis(),
  expire: vi.fn().mockReturnThis(),
  incr: vi.fn().mockReturnThis(),
  decr: vi.fn().mockReturnThis(),
  hset: vi.fn().mockReturnThis(),
  hget: vi.fn().mockReturnThis(),
  hdel: vi.fn().mockReturnThis(),
  sadd: vi.fn().mockReturnThis(),
  smembers: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue([
    [null, 1], // incr result
    [null, 1], // expire result
    [null, '1'], // get result
  ]),
}

// Mock Redis client
const mockRedisClient = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  setex: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  incr: vi.fn().mockResolvedValue(1),
  decr: vi.fn().mockResolvedValue(0),
  expire: vi.fn().mockResolvedValue(1),
  ttl: vi.fn().mockResolvedValue(-1),
  keys: vi.fn().mockResolvedValue([]),
  hset: vi.fn().mockResolvedValue(1),
  hget: vi.fn().mockResolvedValue(null),
  hdel: vi.fn().mockResolvedValue(1),
  sadd: vi.fn().mockResolvedValue(1),
  smembers: vi.fn().mockResolvedValue([]),
  pipeline: vi.fn().mockReturnValue(mockPipeline),
  multi: vi.fn().mockReturnValue(mockPipeline),
  ping: vi.fn().mockResolvedValue('PONG'),
  quit: vi.fn().mockResolvedValue('OK'),
}

export const getRedis = vi.fn().mockReturnValue(mockRedisClient)

// Helper to reset mocks
export const resetRedisMocks = () => {
  mockRedisClient.get.mockResolvedValue(null)
  mockRedisClient.set.mockResolvedValue('OK')
  mockRedisClient.incr.mockResolvedValue(1)
  mockRedisClient.ttl.mockResolvedValue(-1)
  mockPipeline.exec.mockResolvedValue([
    [null, 1], // incr result
    [null, 1], // expire result
    [null, '1'], // get result
  ])
  vi.clearAllMocks()
}
