// Public user ID for unauthenticated access
export const PUBLIC_USER_ID = 'public-user'

// This allows the app to work without authentication
// All projects will be associated with this single public user ID
// Note: You may need to create this user in the database first:
// INSERT INTO users (id, "createdAt", "updatedAt") VALUES ('public-user', NOW(), NOW());
