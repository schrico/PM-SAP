// Barrel export for hooks
// This provides a cleaner import experience: import { useUser, useMyProjects } from '@/hooks';

// User hooks
export { useUser } from './useUser';
export { useUsers } from './useUsers';
export { useUserProfile } from './useUserProfile';
export { useUpdateProfile } from './useUpdateProfile';
export { useUpdateAvatar, AvatarAlreadyTakenError } from './useUpdateAvatar';
export { useUploadAvatar } from './useUploadAvatar';
export { useAvailableAvatars } from './useAvailableAvatars';
export { useRoleAccess } from './useRoleAccess';

// Project hooks
export { useProject } from './useProject';
export { useMyProjects } from './useMyProjects';
export { useProjectsWithTranslators } from './useProjectsWithTranslators';

// UI hooks
export { useColorSettings } from './useColorSettings';
export { useHomeCounts } from './useHomeCounts';
export { useToast, toast } from './use-toast';

