// app/lib/db.mock.ts
// This file is used for building the application when the database is not available

// Mock pool
export const mockPool = {
  connect: () => ({
    query: async () => [],
    release: () => {},
  }),
  query: async () => [],
  end: async () => {},
  on: () => {},
  totalCount: 0,
  idleCount: 0,
  waitingCount: 0,
  options: { max: 10 },
};

// Mock sql tagged template function
export const mockSql: any = (strings: TemplateStringsArray, ...values: any[]) => {
  return [];
};

// Add query method to sql
mockSql.query = async () => [];
