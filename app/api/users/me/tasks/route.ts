import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';
import { Task, Pagination } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get('status');
    const categoryFilter = searchParams.get('category');

    console.log(`GET /api/users/me/tasks - User: ${userId}, Page: ${page}, Limit: ${limit}, Status: ${statusFilter}, Category: ${categoryFilter}`);

    // Build query conditions
    let conditions = [`assigned_user_id = $1`];
    let queryParams = [userId];
    let paramIndex = 2;

    if (statusFilter) {
      conditions.push(`status = $${paramIndex++}`);
      queryParams.push(statusFilter);
    }

    if (categoryFilter) {
      conditions.push(`category = $${paramIndex++}`);
      queryParams.push(categoryFilter);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Fetch tasks
    const tasksQuery = `
      SELECT
        id, title, category, status, priority, assigned_user_id,
        to_char(due_date, 'YYYY-MM-DD') as due_date,
        related_entity_type, related_entity_id, created_at
      FROM tasks
      ${whereClause}
      ORDER BY
        CASE
          WHEN priority = 'Urgent' THEN 1
          WHEN priority = 'High' THEN 2
          WHEN priority = 'Medium' THEN 3
          WHEN priority = 'Low' THEN 4
          ELSE 5
        END,
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
        due_date ASC,
        created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    queryParams.push(limit, offset);

    // Fetch count
    const countQuery = `SELECT COUNT(*) FROM tasks ${whereClause}`;

    const [tasksResult, totalResult] = await Promise.all([
      sql.query(tasksQuery, queryParams),
      sql.query(countQuery, queryParams.slice(0, paramIndex - 2)) // Exclude limit/offset params
    ]);

    const totalTasks = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalTasks / limit);

    // Format tasks for response
    const tasks = tasksResult.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      priority: row.priority,
      assignedUserId: row.assigned_user_id,
      dueDate: row.due_date,
      relatedTo: row.related_entity_type && row.related_entity_id
                ? { type: row.related_entity_type, id: row.related_entity_id }
                : undefined,
      createdAt: row.created_at
    }));

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total: totalTasks,
        totalPages
      }
    });

  } catch (error) {
    console.error('Failed to get user tasks:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
