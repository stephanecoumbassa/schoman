import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationsStore, type Notification } from './notifications'
import api from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    request: vi.fn()
  }
}))

describe('Notifications Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const mockNotification: Notification = {
    _id: '1',
    recipient: 'user123',
    type: 'message',
    title: 'Test Notification',
    message: 'Test message',
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const mockReadNotification: Notification = {
    ...mockNotification,
    _id: '2',
    read: true,
    readAt: new Date().toISOString()
  }

  it('initializes with empty state', () => {
    const store = useNotificationsStore()
    expect(store.notifications).toEqual([])
    expect(store.unreadCount).toBe(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('computes unread notifications correctly', () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification, mockReadNotification]
    
    expect(store.unreadNotifications).toHaveLength(1)
    expect(store.unreadNotifications[0]?._id).toBe('1')
  })

  it('computes read notifications correctly', () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification, mockReadNotification]
    
    expect(store.readNotifications).toHaveLength(1)
    expect(store.readNotifications[0]?._id).toBe('2')
  })

  it('adds notification correctly', () => {
    const store = useNotificationsStore()
    store.addNotification(mockNotification)
    
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]).toStrictEqual(mockNotification)
    expect(store.unreadCount).toBe(1)
  })

  it('does not increment unread count for read notifications', () => {
    const store = useNotificationsStore()
    store.addNotification(mockReadNotification)
    
    expect(store.notifications).toHaveLength(1)
    expect(store.unreadCount).toBe(0)
  })

  it('updates notification correctly', () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification]
    store.unreadCount = 1
    
    const updatedNotification = { ...mockNotification, read: true }
    store.updateNotification(updatedNotification)
    
    expect(store.notifications[0]?.read).toBe(true)
    expect(store.unreadCount).toBe(0)
  })

  it('resets store correctly', () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification]
    store.unreadCount = 1
    store.loading = true
    store.error = 'Error'
    
    store.reset()
    
    expect(store.notifications).toEqual([])
    expect(store.unreadCount).toBe(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches notifications successfully', async () => {
    const store = useNotificationsStore()
    const mockData = {
      notifications: [mockNotification, mockReadNotification],
      unreadCount: 1
    }
    
    vi.mocked(api.request).mockResolvedValueOnce({ data: mockData })
    
    await store.fetchNotifications()
    
    expect(store.notifications).toEqual(mockData.notifications)
    expect(store.unreadCount).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles fetch error correctly', async () => {
    const store = useNotificationsStore()
    vi.mocked(api.request).mockResolvedValueOnce({ error: 'API Error' })
    
    await store.fetchNotifications()
    
    expect(store.error).toBe('API Error')
    expect(store.loading).toBe(false)
  })

  it('marks notification as read', async () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification]
    store.unreadCount = 1
    
    const readNotification = { ...mockNotification, read: true }
    vi.mocked(api.request).mockResolvedValueOnce({ data: readNotification })
    
    await store.markAsRead('1')
    
    expect(store.notifications[0]?.read).toBe(true)
    expect(store.unreadCount).toBe(0)
  })

  it('marks all notifications as read', async () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification, mockReadNotification]
    store.unreadCount = 1
    
    vi.mocked(api.request).mockResolvedValueOnce({ data: {} })
    
    await store.markAllAsRead()
    
    expect(store.notifications.every(n => n.read)).toBe(true)
    expect(store.unreadCount).toBe(0)
  })

  it('deletes notification correctly', async () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification, mockReadNotification]
    store.unreadCount = 1
    
    vi.mocked(api.request).mockResolvedValueOnce({ data: {} })
    
    await store.deleteNotification('1')
    
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]?._id).toBe('2')
    expect(store.unreadCount).toBe(0)
  })

  it('deletes all read notifications', async () => {
    const store = useNotificationsStore()
    store.notifications = [mockNotification, mockReadNotification]
    
    vi.mocked(api.request).mockResolvedValueOnce({ data: {} })
    
    await store.deleteAllRead()
    
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]?._id).toBe('1')
  })
})
