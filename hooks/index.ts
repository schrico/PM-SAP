// Barrel export for hooks
// This provides a cleaner import experience: import { useUser, useMyProjects } from '@/hooks';

// Core hooks
export { useSupabase } from './useSupabase';
export { usePagination } from './usePagination';

// User hooks
export { useUser } from './useUser';
export { useUsers } from './useUsers';
export { useUpdateProfile } from './useUpdateProfile';
export { useUpdateAvatar, AvatarAlreadyTakenError } from './useUpdateAvatar';
export { useUploadAvatar } from './useUploadAvatar';
export { useAvailableAvatars } from './useAvailableAvatars';
export { useRoleAccess } from './useRoleAccess';
export { useThemePreference, resolveTheme, type ThemePreference } from './useThemePreference';
export { useUpdateUserRole } from './useUpdateUserRole';
export { useUserWorkload } from './useUserWorkload';

// Project hooks
export { useProject } from './useProject';
export { useMyProjects } from './useMyProjects';
export { useProjectsWithTranslators } from './useProjectsWithTranslators';
export { useUpdateProject } from './useUpdateProject';
export { useUpdateAssignment } from './useUpdateAssignment';

// Concurrency hooks
export { useConcurrencySafeMutation } from './useConcurrencySafeMutation';

// UI hooks
export { useColorSettings } from './useColorSettings';
export { useHomeCounts } from './useHomeCounts';
export { useToast, toast } from './use-toast';

