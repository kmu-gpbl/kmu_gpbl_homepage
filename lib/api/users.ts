import type {
  User,
  UserSummary,
  ApiResponse,
  PaginatedResponse,
  GetUsersQuery,
} from "@/types/api";
import usersData from "@/data/users.json";

// Simulate API delay
const simulateDelay = (ms: number = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Create API response format
const createApiResponse = <T>(
  data: T,
  message: string = "Success"
): ApiResponse<T> => ({
  data,
  status: 200,
  message,
  timestamp: new Date().toISOString(),
});

const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = "Success"
): PaginatedResponse<T> => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
  status: 200,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Get all users with optional filtering and pagination
 * GET /api/users
 */
export async function getUsers(
  query: GetUsersQuery = {}
): Promise<PaginatedResponse<UserSummary>> {
  await simulateDelay();

  const { specialty, page = 1, limit = 10, search } = query;
  let filteredUsers = usersData.users;

  // Filter by specialty
  if (specialty && specialty !== "all") {
    filteredUsers = filteredUsers.filter((user) =>
      user.specialties.includes(specialty)
    );
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.skills.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Convert to UserSummary
  const userSummaries: UserSummary[] = paginatedUsers.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    specialties: user.specialties,
  }));

  return createPaginatedResponse(
    userSummaries,
    page,
    limit,
    filteredUsers.length,
    `Retrieved ${userSummaries.length} users`
  );
}

/**
 * Get user by ID
 * GET /api/users/:id
 */
export async function getUserById(
  id: string
): Promise<ApiResponse<User | null>> {
  await simulateDelay();

  const user = usersData.users.find((u) => u.id === id);

  if (!user) {
    return {
      data: null,
      status: 404,
      message: `User with ID ${id} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  return createApiResponse(user, `User ${user.name} retrieved successfully`);
}

/**
 * Get users by IDs
 * POST /api/users/batch
 */
export async function getUsersByIds(
  ids: string[]
): Promise<ApiResponse<UserSummary[]>> {
  await simulateDelay();

  const users = usersData.users.filter((user) => ids.includes(user.id));

  const userSummaries: UserSummary[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    specialties: user.specialties,
  }));

  return createApiResponse(
    userSummaries,
    `Retrieved ${userSummaries.length} users`
  );
}

/**
 * Get user summary by ID
 * GET /api/users/:id/summary
 */
export async function getUserSummaryById(
  id: string
): Promise<ApiResponse<UserSummary | null>> {
  await simulateDelay();

  const user = usersData.users.find((u) => u.id === id);

  if (!user) {
    return {
      data: null,
      status: 404,
      message: `User with ID ${id} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  const userSummary: UserSummary = {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    specialties: user.specialties,
  };

  return createApiResponse(
    userSummary,
    `User summary for ${user.name} retrieved successfully`
  );
}

/**
 * Get users by specialty
 * GET /api/users/specialty/:specialty
 */
export async function getUsersBySpecialty(
  specialty: string
): Promise<ApiResponse<UserSummary[]>> {
  await simulateDelay();

  const filteredUsers = usersData.users.filter(
    (user) => specialty === "all" || user.specialties.includes(specialty)
  );

  const userSummaries: UserSummary[] = filteredUsers.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    specialties: user.specialties,
  }));

  return createApiResponse(
    userSummaries,
    `Retrieved ${userSummaries.length} users with specialty: ${specialty}`
  );
}
