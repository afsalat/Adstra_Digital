/**
 * Utility functions for checking user permissions frontend-side.
 */

export const FULL_ACCESS_ROLES = new Set(["admin", "super_admin"]);

/**
 * Checks if a user has a specific permission.
 * @param {Object} user - The user object from AuthContext or localStorage
 * @param {string|string[]} permissionCode - A single permission code or array of acceptable codes
 * @returns {boolean} True if the user has permission
 */
export function hasPermission(user, permissionCode) {
  if (!user) return false;

  // Superuser / Admin role bypass
  if (
    user.is_superuser ||
    FULL_ACCESS_ROLES.has(user.role) ||
    user.role === "super_admin"
  ) {
    return true;
  }

  const userPerms = new Set([
    ...(user.custom_permissions || []),
    ...(user.effective_permissions || []),
    ...(user.permissions || []),
  ]);

  // Global wildcard
  if (userPerms.has("*")) return true;

  if (Array.isArray(permissionCode)) {
    return permissionCode.some((code) => userPerms.has(code) || userPerms.has("*"));
  }

  return userPerms.has(permissionCode);
}
