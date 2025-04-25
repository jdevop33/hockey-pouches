import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { verifyAuth, unauthorizedResponse, forbiddenResponse } from '@/lib/auth'; // Import auth functions
import { Task } from '@/types'; // Assuming a Task type exists

export const dynamic = 'force-dynamic';

// Function to check if user has access (is admin or assigned user)
async function checkTaskAccess(taskId: number, userId: string, userRole: string): Promise<boolean> {
  console.log(`Checking access for task ${taskId} by user ${userId} (Role: ${userRole})`);
  if (userRole === 'Admin') {
    return true; // Admins can access all tasks
  }
  // Check if the user is assigned to the task
  const taskAssignment = await sql`
    SELECT id
    FROM tasks
    WHERE id = ${taskId} AND assigned_user_id = ${userId}
  `;
  return taskAssignment.length > 0;
}

// --- GET Handler: Fetch specific task details ---
export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId: taskIdString } = params;
  const taskId = parseInt(taskIdString);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid Task ID format.' }, { status: 400 });
  }

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }
    const { userId, role: userRole } = authResult;

    // Check access control
    const canAccess = await checkTaskAccess(taskId, userId, userRole);
    if (!canAccess) {
      return forbiddenResponse('You do not have permission to view this task.');
    }

    console.log(`GET /api/tasks/${taskId} - User: ${userId}`);

    // Fetch task details from DB, joining with users for names
    const taskResult = await sql`
      SELECT
        t.id,
        t.title,
        t.description,
        t.category,
        t.status,
        t.priority,
        t.assigned_user_id as "assignedUserId",
        assignee.name as "assignedUserName",
        t.created_by_user_id as "createdByUserId",
        creator.name as "createdByUserName",
        to_char(t.due_date, 'YYYY-MM-DD') as "dueDate",
        t.related_entity_type as "relatedEntityType",
        t.related_entity_id as "relatedEntityId",
        t.created_at as "createdAt",
        t.completed_at as "completedAt",
        t.updated_at as "updatedAt"
      FROM tasks t
      LEFT JOIN users assignee ON t.assigned_user_id = assignee.id
      LEFT JOIN users creator ON t.created_by_user_id = creator.id
      WHERE t.id = ${taskId}
    `;

    if (taskResult.length === 0) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    // Format the relatedTo field
    const taskData = taskResult[0];
    const taskResponse = {
      ...taskData,
      relatedTo: taskData.relatedEntityType && taskData.relatedEntityId
                   ? { type: taskData.relatedEntityType, id: taskData.relatedEntityId }
                   : undefined,
    };
    // Remove the separate entity fields if relatedTo is constructed
    delete taskResponse.relatedEntityType;
    delete taskResponse.relatedEntityId;

    return NextResponse.json(taskResponse as Task);
  } catch (error) {
    console.error(`GET /api/tasks/${taskId}: Failed to fetch task:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT Handler: Update specific task details ---
export async function PUT(request: NextRequest, { params }: { params: { taskId: string } }) {
  const { taskId: taskIdString } = params;
  const taskId = parseInt(taskIdString);

  if (isNaN(taskId)) {
    return NextResponse.json({ message: 'Invalid Task ID format.' }, { status: 400 });
  }

  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }
    const { userId, role: userRole } = authResult;

    // Check access control (only assigned user or admin can update)
    const canAccess = await checkTaskAccess(taskId, userId, userRole);
    if (!canAccess) {
      return forbiddenResponse('You do not have permission to update this task.');
    }

    console.log(`PUT /api/tasks/${taskId} - User: ${userId}`);

    // Check if task exists before update
    const taskCheck = await sql`SELECT id FROM tasks WHERE id = ${taskId}`;
    if (taskCheck.length === 0) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      status,
      priority,
      assignedUserId,
      dueDate,
      // relatedTo is not directly updatable here, handled via specific actions
    } = body;

    // Build dynamic update query
    let updateFields = [];
    let updateValues = [];
    let valueIndex = 1;

    // --- Add fields to update --- 
    if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') return NextResponse.json({ message: 'Title cannot be empty.' }, { status: 400 });
        updateFields.push(`title = $${valueIndex++}`); updateValues.push(title.trim());
    }
    if (description !== undefined) { updateFields.push(`description = $${valueIndex++}`); updateValues.push(description); }
    if (category !== undefined) { updateFields.push(`category = $${valueIndex++}`); updateValues.push(category); }
    if (status !== undefined) { updateFields.push(`status = $${valueIndex++}`); updateValues.push(status); }
    if (priority !== undefined) { updateFields.push(`priority = $${valueIndex++}`); updateValues.push(priority); }
    if (assignedUserId !== undefined) { updateFields.push(`assigned_user_id = $${valueIndex++}`); updateValues.push(assignedUserId); }
    if (dueDate !== undefined) { updateFields.push(`due_date = $${valueIndex++}`); updateValues.push(dueDate); }
    
    // --- Check if any fields were provided --- 
    if (updateFields.length === 0) {
        return NextResponse.json({ message: 'No updatable fields provided.' }, { status: 400 });
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(taskId); // Add taskId for WHERE clause

    // Use the pool for the parameterized query
    const { pool } = await import('@/lib/db');
    const result = await pool.query(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING id`, 
      updateValues
    );

    if (result.rowCount === 0) {
       throw new Error('Failed to update task in database.');
    }

    // Fetch and return the updated task data using the GET handler logic
     const fetchResponse = await GET(request, { params: { taskId: taskIdString } });
     return fetchResponse; // Return the response from the GET handler

  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }
    console.error(`PUT /api/tasks/${taskId}: Failed to update task:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
