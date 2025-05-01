// app/api/users/me/tasks/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { taskService } from '@/lib/services/task-service'; // Keep specific service import
import { logger } from '@/lib/logger'; // Keep logger import
import { users } from '@/lib/schema/users';
import { tasks } from '@/lib/schema/tasks';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums

// Define types based on schema enums (from stash)
type TaskStatus = typeof schema.taskStatusEnum.enumValues[number];
type TaskCategory = typeof schema.taskCategoryEnum.enumValues[number];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;

        const searchParams = request.nextUrl.searchParams;
        // Get and validate query parameters
        const statusParam = searchParams.get('status');
        const categoryParam = searchParams.get('category');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Validate enum parameters if provided (from stash)
        let status: TaskStatus | undefined;
        if (statusParam) {
            if (!schema.taskStatusEnum.enumValues.includes(statusParam as TaskStatus)) {
                return NextResponse.json({ message: 'Invalid status parameter' }, { status: 400 });
            }
            status = statusParam as TaskStatus;
        }

        let category: TaskCategory | undefined;
        if (categoryParam) {
            if (!schema.taskCategoryEnum.enumValues.includes(categoryParam as TaskCategory)) {
                 return NextResponse.json({ message: 'Invalid category parameter' }, { status: 400 });
            }
            category = categoryParam as TaskCategory;
        }

        logger.info('Fetching tasks for user', { userId, status, category, page, limit });

        // Call task service method
        // Assuming taskService.listUserTasks exists and is implemented
        const result = await taskService.listUserTasks(userId, {
            status,
            category,
            page,
            limit,
        });

        logger.info(`Found ${result.pagination.total} tasks for user`, { userId });
        return NextResponse.json(result);

    } catch (error: any) {
        // Catch potential errors if taskService isn't implemented
        if (error.message?.includes('not implemented') || error.message?.includes('taskService.listUserTasks is not a function')){
             logger.error('TaskService.listUserTasks not implemented', { userId });
             return NextResponse.json({ message: 'Task fetching is not available.' }, { status: 501 });
        }
        logger.error('GET /api/users/me/tasks error:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching tasks.' }, { status: 500 });
    }
}
