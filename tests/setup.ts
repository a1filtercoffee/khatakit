import { beforeEach } from 'vitest';

// Each test represents a new browser tab. Individual recovery tests keep storage
// across unmount/remount inside the same test.
beforeEach(() => sessionStorage.clear());
