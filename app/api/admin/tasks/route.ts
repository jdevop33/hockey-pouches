import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

// Type for raw database row from tasks table
interface TaskRow {
  id: number;
  title: string;
  category: string;
  status: string;
  priority: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  dueDate: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
  count?: string; // For count queries
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  // TODO: Admin Auth Check
  

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // --- Filtering ---
    const filterStatus = searchParams.get('status');
    const filterCategory = searchParams.get('category');
    const filterAssignedUserId = searchParams.get('assignedUserId');

    // Build the WHERE clauses dynamically
    const whereConditions = [];
    const queryParams = [];

    if (filterStatus) {
      whereConditions.push('t.status = ?');
      queryParams.push(filterStatus);
    }

    if (filterCategory) {
      whereConditions.push('t.category = ?');
      queryParams.push(filterCategory);
    }

    if (filterAssignedUserId) {
      if (filterAssignedUserId === 'unassigned') {
        whereConditions.push('t.assigned_user_id IS NULL');
      } else {
        whereConditions.push('t.assigned_user_id = ?');
        queryParams.push(filterAssignedUserId);
      }
    }

    const whereClause =
      whereConditions.length > 0 ? sql`WHERE ${sql.raw(whereConditions.join(' AND '))}` : sql``;

    // Construct the query using sql template literals for safety
    const tasksQuery = sql`
      SELECT
        t.id, t.title, t.category, t.status, t.priority,
        t.assigned_user_id as "assignedUserId",
        u.name as "assignedUserName",
        to_char(t.due_date, 'YYYY-MM-DD') as "dueDate",
        t.related_entity_type as "relatedEntityType",
        t.related_entity_id as "relatedEntityId",
        t.created_at as "createdAt"
      FROM tasks t
      LEFT JOIN users u ON t.assigned_user_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = sql`
      SELECT COUNT(*) as count 
      FROM tasks t 
      ${whereClause}
    `;

    // Execute queries
    const [tasksResult, totalResult] = await Promise.all([
      db.execute(tasksQuery),
      db.execute(countQuery),
    ]);

    const totalTasks = parseInt(totalResult[0]?.count || '0');
    const totalPages = Math.ceil(totalTasks / limit);

    // Map results to the frontend type
    const tasks = tasksResult.map((row: TaskRow) => ({
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
    }));

    return NextResponse.json({
      tasks,
      pagination: { page, limit, total: totalTasks, totalPages },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Admin: Failed to get tasks:', error);
    const errorMessage = error instanceof Error ? errorMessage : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// --- POST Handler (Create New Task by Admin) ---
export async function POST(request: NextRequest) {
  // TODO: Add Admin Auth Check
  

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
    

    // Fetch the created task to return it
    // (Might need the complex query from GET handler)
    const newTask =
      await sql`SELECT *, created_at as "createdAt" FROM tasks WHERE id = ${newTaskId}`;

    // TODO: Re-map newTask to AdminTaskList type if necessary

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    console.error('Admin: Failed to create task:', error);
    return NextResponse.json(
      { message: errorMessage || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
