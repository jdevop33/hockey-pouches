import { NextResponse, type NextRequest } from 'next/server';
import { sql } from '@/lib/db';

// TODO: Add JWT verification + Admin role check

export const dynamic = 'force-dynamic';

// Type for the returned task list item
interface AdminTaskList {
  id: number;
  title: string;
  category: string;
  status: string;
  priority?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null; // From join
  dueDate?: string | null;
  relatedTo?: { type: string | null; id: string | null };
  createdAt: string;
}

export async function GET(request: NextRequest) {
  // TODO: Admin Auth Check
  console.log('GET /api/admin/tasks request');

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // --- Filtering ---
    const filterStatus = searchParams.get('status');
    const filterCategory = searchParams.get('category');
    const filterAssignedUserId = searchParams.get('assignedUserId');
    // TODO: Add filters for due date range, priority, search query

    let conditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (filterStatus) {
      conditions.push(`t.status = $${paramIndex++}`);
      queryParams.push(filterStatus);
    }
    if (filterCategory) {
      conditions.push(`t.category = $${paramIndex++}`);
      queryParams.push(filterCategory);
    }
    if (filterAssignedUserId) {
      if (filterAssignedUserId === 'unassigned') {
        conditions.push(`t.assigned_user_id IS NULL`);
      } else {
        conditions.push(`t.assigned_user_id = $${paramIndex++}`);
        queryParams.push(filterAssignedUserId);
      }
    }
    // TODO: Add more filter conditions

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // --- Database Query ---
    const tasksQuery = `
            SELECT
                t.id, t.title, t.category, t.status, t.priority,
                t.assigned_user_id as "assignedUserId",
                u.name as "assignedUserName",
                to_char(t.due_date, 'YYYY-MM-DD') as "dueDate", -- Format date
                t.related_entity_type as "relatedEntityType",
                t.related_entity_id as "relatedEntityId",
                t.created_at as "createdAt"
            FROM tasks t
            LEFT JOIN users u ON t.assigned_user_id = u.id
            ${whereClause}
            ORDER BY t.created_at DESC -- Adjust sorting as needed
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
    queryParams.push(limit.toString(), offset.toString());

    const countQuery = `SELECT COUNT(*) FROM tasks t ${whereClause}`;
    const countQueryParams = queryParams.slice(0, conditions.length);

    console.log('Executing Admin Tasks Query:', tasksQuery, queryParams);
    console.log('Executing Admin Tasks Count Query:', countQuery, countQueryParams);

    const [tasksResult, totalResult] = await Promise.all([
      sql.query(tasksQuery, queryParams),
      sql.query(countQuery, countQueryParams),
    ]);

    const totalTasks = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalTasks / limit);

    // Map results to the frontend type, creating the relatedTo object
    const tasks = tasksResult.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      priority: row.priority,
      assignedUserId: row.assignedUserId,
      assignedUserName: row.assignedUserName,
      dueDate: row.dueDate,
      relatedTo:
        row.relatedEntityType && row.relatedEntityId
          ? { type: row.relatedEntityType, id: row.relatedEntityId }
          : undefined,
      createdAt: row.createdAt,
    })) as AdminTaskList[];

    return NextResponse.json({
      tasks: tasks,
      pagination: { page, limit, total: totalTasks, totalPages },
    });
  } catch (error: any) {
    console.error('Admin: Failed to get tasks:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// --- POST Handler (Create New Task by Admin) ---
export async function POST(request: NextRequest) {
  // TODO: Add Admin Auth Check
  console.log('POST /api/admin/tasks request');

  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      status = 'Pending',
      priority,
      assignedUserId,
      dueDate,
      relatedTo,
    } = body;

    // Validation
    if (!title || !category) {
      return NextResponse.json({ message: 'Title and Category are required.' }, { status: 400 });
    }
    // TODO: Add validation for status, priority, assignedUserId (exists?), relatedTo format, date format?

    console.log('Creating new task:', body);

    // Insert new task
    const result = await sql`
            INSERT INTO tasks (title, description, category, status, priority, assigned_user_id, due_date, related_entity_type, related_entity_id, created_by_user_id)
            VALUES (
                ${title}, ${description || null}, ${category}, ${status}, ${priority || null},
                ${assignedUserId || null},
                ${dueDate || null},
                ${relatedTo?.type || null},
                ${relatedTo?.id || null},
                ${null} -- TODO: Get actual adminUserId performing the action
            )
            RETURNING id
        `;

    const newTaskId = result[0]?.id;
    if (!newTaskId) {
      throw new Error('Failed to create task.');
    }
    console.log('New task created with ID:', newTaskId);

    // Fetch the created task to return it
    // (Might need the complex query from GET handler)
    const newTask =
      await sql`SELECT *, created_at as "createdAt" FROM tasks WHERE id = ${newTaskId}`;

    // TODO: Re-map newTask to AdminTaskList type if necessary

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error: any) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error('Admin: Failed to create task:', error);
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
