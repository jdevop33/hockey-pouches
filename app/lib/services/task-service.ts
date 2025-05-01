// app/lib/services/task-service.ts
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema/tasks';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
import { eq, and, or, ilike, count, desc, asc, sql, SQL } from 'drizzle-orm';
import { logger } from '@/lib/logger';
// Types
export type TaskSelect = typeof schema.tasks.$inferSelect;
export type TaskInsert = typeof schema.tasks.$inferInsert;
export type TaskStatus = (typeof schema.taskStatusEnum.enumValues)[number];
export type TaskPriority = (typeof schema.taskPriorityEnum.enumValues)[number];
export type TaskCategory = (typeof schema.taskCategoryEnum.enumValues)[number];
export interface ListTasksOptions {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  category?: TaskCategory;
  priority?: TaskPriority;
  assignedTo?: string | null; // User ID or null for unassigned?
  // Add date range, relatedTo/Id filters if needed
}
export interface ListTasksResult {
  tasks: TaskSelect[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export class TaskService {
  async listTasks(
    options: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      priority?: string;
      assignedTo?: string;
    } = {}
  ): Promise<ListTasksResult> {
    // Default empty object for ListTasksResult
    const defaultTask = {
      id: 0,
      status: "Pending",
      createdAt: null,
      updatedAt: null,
      notes: null,
      description: null,
      dueDate: null,
      priority: null,
      category: null,
      assignedTo: null
    };

    const { page = 1, limit = 20, status, category, priority, assignedTo } = options;
    try {
      const offset = (page - 1) * limit;
      const conditions: SQL[] = [];
      if (status) {
        conditions.push(eq(schema.tasks.status, status as TaskStatus));
      }
      if (category) {
        conditions.push(eq(schema.tasks.category, category as TaskCategory));
      }
      if (priority) {
        conditions.push(eq(schema.tasks.priority, priority as TaskPriority));
      }
      if (assignedTo !== undefined) {
        // Handle null for unassigned or specific user ID
        conditions.push(
          assignedTo === null
            ? sql`${schema.tasks.assignedTo} IS NULL`
            : assignedTo ? eq(schema.tasks.assignedTo, assignedTo) : undefined
        );
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      // Custom sorting logic (Priority -> Due Date -> Created Date)
      // Note: Drizzle doesn't directly support CASE in orderBy easily, use raw SQL or map priorities
      const priorityOrder = sql`CASE
                WHEN ${schema.tasks.priority} = 'Urgent' THEN 1
                WHEN ${schema.tasks.priority} = 'High' THEN 2
                WHEN ${schema.tasks.priority} = 'Medium' THEN 3
                WHEN ${schema.tasks.priority} = 'Low' THEN 4
                ELSE 5 END`;
      // TODO: Add Due Date sorting if schema has it
      // const dueDateOrder = sql`CASE WHEN ${schema.tasks.dueDate} IS NULL THEN 1 ELSE 0 END, ${schema.tasks.dueDate} ASC`;
      const query = db.query.tasks.findMany({
        where: whereClause,
        orderBy: [asc(priorityOrder), /* asc(dueDateOrder), */ desc(schema.tasks.createdAt)],
        limit,
        offset,
        // Optionally include assignee relation
        // with: { assignee: { columns: { name: true } } }
      });
      const countQuery = db.select({ total: count() }).from(schema.tasks).where(whereClause);
      const [results, countResult] = await Promise.all([query, countQuery]);
      const total = countResult[0].total;

      return {
        tasks: results,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };
    } catch (error) {
      logger.error('Error listing tasks:', { options, error });
      throw new Error('Failed to list tasks.');
    }
  }
  // Simplified version for user's own tasks
  async listUserTasks(
    userId: string,
    options: { page?: number; limit?: number; status?: TaskStatus; category?: TaskCategory }
  ): Promise<ListTasksResult> {
    return this.listTasks({ ...options, assignedTo: userId });
  }
  // TODO: Add methods for createTask, updateTask, getTaskById, etc.
  async updateTaskStatus(taskId: string, status: string, userId: string): Promise<TaskSelect> {
    // Implementation of updateTaskStatus

    try {
      const result = await db
        .update(schema.tasks)
        .set({ status: status as TaskStatus, updatedAt: new Date() })
        // Optionally add check if task is assigned to user? userId: string
        .where(eq(schema.tasks.id, Number(taskId)))
        .returning();
      if (result.length === 0) throw new Error('Task not found or update failed.');
      logger.info('Task status updated', { taskId, status, userId });
      return result[0];
    } catch (error) {
      logger.error('Error updating task status', { taskId, status, userId, error });
      throw new Error('Failed to update task status');
    }
  }
}
export const taskService = new TaskService();
