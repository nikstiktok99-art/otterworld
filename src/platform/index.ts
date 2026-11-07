import { Capacitor } from '@capacitor/core';
import type { Platform } from './types';
import { createNativePlatform } from './native';
import { createWebPlatform } from './web';

export type { Platform } from './types';

export function createPlatform(): Platform {
  return Capacitor.isNativePlatform() ? createNativePlatform() : createWebPlatform();
}
