// app/api/users/me/tasks/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { taskService } from '@/lib/services/task-service'; // Use new service
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use schema for enums
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // --- Authentication ---
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;

        // --- Parse Query Params ---
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status') as schema.TaskStatus | undefined;
        const category = searchParams.get('category') as schema.TaskCategory | undefined;

        logger.info(`GET /api/users/me/tasks request`, { userId, page, limit, status, category });

        // Optional: Validate enums
        if (status && !schema.taskStatusEnum.enumValues.includes(status)) {
             return NextResponse.json({ message: `Invalid status filter: ${status}` }, { status: 400 });
        }
         if (category && !schema.taskCategoryEnum.enumValues.includes(category)) {
             return NextResponse.json({ message: `Invalid category filter: ${category}` }, { status: 400 });
        }

        // --- Call Service Method ---
        const result = await taskService.listUserTasks(userId, {
            page,
            limit,
            status,
            category,
        });

        return NextResponse.json(result);

    } catch (error) {
        logger.error('Failed to get user tasks:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching tasks.' }, { status: 500 });
    }
}
