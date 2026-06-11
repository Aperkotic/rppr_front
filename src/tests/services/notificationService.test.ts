import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Notification } from '../../services/notification/types';

let service: typeof import('../../services/notification/notificationService').notificationService;

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  const mod = await import('../../services/notification/notificationService');
  service = mod.notificationService;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('notificationService', () => {
  it('subscribe adds listener and immediately calls it with current notifications', () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith([]);
    unsubscribe();
  });

  it('unsubscribe removes listener (no longer called)', () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    unsubscribe();
    service.show('info', 'Test');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('show adds a notification and emits to listeners', () => {
    const listener = vi.fn();
    service.subscribe(listener);
    service.show('success', 'Hello');
    expect(listener).toHaveBeenCalledTimes(2);
    const notifications = listener.mock.calls[1][0] as Notification[];
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Hello');
    expect(notifications[0].id).toBeTruthy();
  });

  it('does not add notification for empty message (after trim)', () => {
    const listener = vi.fn();
    service.subscribe(listener);
    service.show('error', '   ');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('dismiss removes the notification and emits', () => {
    const listener = vi.fn();
    service.subscribe(listener);
    service.show('info', 'Keep');
    const id = listener.mock.calls[1][0][0].id;
    service.dismiss(id);
    expect(listener).toHaveBeenCalledTimes(3);
    const notificationsAfterDismiss = listener.mock.calls[2][0] as Notification[];
    expect(notificationsAfterDismiss).toHaveLength(0);
  });

  it('auto‑dismiss after default duration', () => {
    const listener = vi.fn();
    service.subscribe(listener);
    service.show('info', 'Auto');
    expect(listener).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(4999);
    expect(listener).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(listener).toHaveBeenCalledTimes(3);
    const notifications = listener.mock.calls[2][0] as Notification[];
    expect(notifications).toHaveLength(0);
  });

  it('does not auto‑dismiss when duration is 0', () => {
    const listener = vi.fn();
    service.subscribe(listener);
    service.show('info', 'Persistent', 0);
    vi.advanceTimersByTime(10000);
    expect(listener).toHaveBeenCalledTimes(2); 
  });

  it('success, error, info shortcuts call show with correct type', () => {
    const listener = vi.fn();
    service.subscribe(listener);

    service.success('Yes');
    service.error('No');
    service.info('Maybe');

    expect(listener).toHaveBeenCalledTimes(4); 
    const allNotes = listener.mock.calls[3][0] as Notification[];
    expect(allNotes).toHaveLength(3);
    expect(allNotes.map(n => n.type)).toEqual(['success', 'error', 'info']);
  });
});