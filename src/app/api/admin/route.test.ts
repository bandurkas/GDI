import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { getServerSession } from 'next-auth';
import { UserService } from '@/services/user.service';
import { NextResponse } from 'next/server';

vi.mock('next-auth');
vi.mock('@/services/user.service');
vi.mock('@/services/order.service');

describe('Admin API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 403 if user is not an admin', async () => {
        (getServerSession as any).mockResolvedValue({ user: { role: 'USER' } });
        const req = new Request('http://localhost/api/admin?type=users');

        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.error).toBe('Unauthorized');
    });

    it('should return users if user is an admin', async () => {
        (getServerSession as any).mockResolvedValue({ user: { role: 'ADMIN' } });
        (UserService.getAllUsersWithStats as any).mockResolvedValue({
            users: [{ email: 'user@test.com' }],
            total: 1
        });

        const req = new Request('http://localhost/api/admin?type=users');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data).toHaveLength(1);
        expect(data.meta.total).toBe(1);
    });

    it('should return 400 for invalid type', async () => {
        (getServerSession as any).mockResolvedValue({ user: { role: 'ADMIN' } });
        const req = new Request('http://localhost/api/admin?type=invalid');

        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBe('Invalid type');
    });
});
