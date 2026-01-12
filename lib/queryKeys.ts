/**
 * Centralized query key factory functions for React Query
 * 
 * This ensures consistent query key structure across the application
 * and makes it easier to invalidate related queries.
 */

export const queryKeys = {
  // User-related queries
  user: () => ['user'] as const,
  userProfile: () => ['user-profile'] as const,
  users: () => ['users'] as const,
  
  // Project-related queries
  project: (id: number | string | null) => ['project', id] as const,
  projects: () => ['projects'] as const,
  projectsWithTranslators: (showPast?: boolean, showAll?: boolean) => 
    ['projects-with-translators', showPast, showAll] as const,
  myProjects: (userId: string | null) => ['my-projects', userId] as const,
  
  // Home page counts
  homeMyProjectsCount: (userId: string | null | undefined) => 
    ['home-my-projects-count', userId] as const,
  homeManageProjectsCount: () => ['home-manage-projects-count'] as const,
  
  // Settings and configuration
  colorSettings: () => ['color-settings'] as const,
  availableAvatars: () => ['available-avatars'] as const,
} as const;
