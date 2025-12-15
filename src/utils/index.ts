export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}

// Re-export permission utilities for easy access
export {
    parsePermission,
    parsePermissions,
    getAvailablePermissions,
    isValidPermission,
    formatPermissionCode
} from './permissions';