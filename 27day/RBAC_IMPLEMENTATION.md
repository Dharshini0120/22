# Role-Based Access Control (RBAC) Implementation

This document outlines the comprehensive RBAC system implemented in the admin portal.

## Overview

The RBAC system provides fine-grained permission control based on user roles and module-specific permissions. It includes:

- **Permission-based navigation filtering**
- **Route guards for page access control**
- **Component-level permission checks**
- **Automatic redirection for unauthorized access**

## Core Components

### 1. Permission Hooks (`useModulePermissions.ts`)

#### `useModulePermissions(moduleName: string)`
Returns permission flags for a specific module:
```typescript
const { canCreate, canRead, canUpdate, canDelete } = useModulePermissions("Datasets");
```

#### `useHasModuleAccess(moduleName: string)`
Checks if user has any permission for a module:
```typescript
const hasAccess = useHasModuleAccess("Users");
```

#### `useAccessibleModules()`
Returns array of all modules the user can access:
```typescript
const accessibleModules = useAccessibleModules(); // ["Dashboard", "Datasets", "Forms"]
```

### 2. Route Guard (`RouteGuard.tsx`)

Protects routes based on permissions:

```tsx
<RouteGuard requiredModule="Datasets" requiredPermission="read">
  <DatasetsPage />
</RouteGuard>
```

**Features:**
- Automatic redirection to `/unauthorized` for denied access
- Path-based permission checking
- Support for nested routes

### 3. Direct Permission Usage

Use the `useModulePermissions` hook directly for optimal performance:

```tsx
const UserManagementPage = () => {
  const { canCreate, canRead, canUpdate, canDelete } = useModulePermissions("User Management");

  return (
    <div>
      {canCreate && (
        <Button variant="contained" onClick={handleCreate}>
          Create User
        </Button>
      )}
      
      {canRead && <UserTable />}
      
      {canUpdate && (
        <Button variant="outlined" onClick={handleEdit}>
          Edit User
        </Button>
      )}
      
      {canDelete && (
        <Button color="error" onClick={handleDelete}>
          Delete User
        </Button>
      )}
    </div>
  );
};
```

## Implementation Examples

### 1. Page-Level Protection

```tsx
// In datasets/page.tsx
const DatasetsPage: React.FC = () => {
  const { canRead, canCreate, canUpdate, canDelete } = useModulePermissions("Datasets");

  if (!canRead) {
    return <div>Access Denied</div>;
  }

  return (
    <RouteGuard requiredModule="Datasets" requiredPermission="read">
      <DashboardLayout>
        {/* Page content */}
      </DashboardLayout>
    </RouteGuard>
  );
};
```

### 2. Conditional Button Rendering

```tsx
const UserManagement = () => {
  const { canCreate, canUpdate, canDelete } = useModulePermissions("Users");

  return (
    <div>
      <h1>User Management</h1>

      {canCreate && (
        <button onClick={handleCreateUser}>
          Create New User
        </button>
      )}

      <table>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>
              {canUpdate && (
                <button onClick={() => handleEdit(user.id)}>Edit</button>
              )}
              {canDelete && (
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};
```

### 3. Sidebar Filtering

The sidebar automatically filters menu items based on user permissions:

```typescript
// In DashboardLayout.tsx
const accessibleModules = useAccessibleModules();
const navigationItems = getNavigationItemsByPermissions(accessibleModules);
```

## Permission Structure

### Module Mapping
Each navigation item maps to a module name:
```typescript
const allNavigationItems = {
  dashboard: { 
    text: 'Dashboard', 
    moduleName: 'Dashboard',
    path: '/dashboard' 
  },
  datasets: { 
    text: 'Datasets', 
    moduleName: 'Datasets',
    path: '/datasets' 
  },
  // ... more items
};
```

### Permission Types
- **create**: Can create new items
- **read**: Can view/read items
- **update**: Can edit existing items
- **delete**: Can delete items

### SuperAdmin Access
SuperAdmin users automatically have all permissions for all modules.

## Redux Integration

The system integrates with Redux store:

```typescript
// State structure
interface RoleState {
  roleData: {
    modules: Array<{
      name: string;
      slug: string;
      permissions: {
        create: boolean;
        view: boolean;
        update: boolean;
        delete: boolean;
      };
    }>;
  };
}
```

## Security Features

1. **Client-side validation**: Immediate UI feedback
2. **Server-side validation**: Backend permission checks (recommended)
3. **Automatic redirection**: Unauthorized users redirected to `/unauthorized`
4. **Permission persistence**: Permissions maintained across page navigation
5. **Role-based defaults**: Different default permissions per role

## Usage Guidelines

### 1. Always Use Route Guards
```tsx
<RouteGuard requiredModule="ModuleName" requiredPermission="read">
  <YourComponent />
</RouteGuard>
```

### 2. Check Permissions Before Rendering
```tsx
const { canRead } = useModulePermissions("ModuleName");
if (!canRead) return <AccessDenied />;
```

### 3. Use Permission Components
```tsx
<PermissionButton moduleName="ModuleName" permission="create">
  Create Item
</PermissionButton>
```

### 4. Provide Fallbacks
```tsx
<PermissionSection 
  moduleName="ModuleName" 
  permission="create"
  fallback={<div>No permission message</div>}
>
  <CreateForm />
</PermissionSection>
```

## Error Handling

- **Unauthorized access**: Redirects to `/unauthorized` page
- **Missing permissions**: Shows appropriate fallback content
- **Invalid modules**: Gracefully handles unknown modules
- **Network errors**: Maintains existing permissions on API failures

## Testing

Test the RBAC system by:

1. **Different user roles**: Test with SuperAdmin, Admin, and User roles
2. **Permission changes**: Modify permissions in role management
3. **Navigation**: Verify sidebar filtering works correctly
4. **Route protection**: Test direct URL access with different permissions
5. **Component rendering**: Verify buttons/sections show/hide correctly

## Future Enhancements

1. **Dynamic permissions**: Real-time permission updates
2. **Permission inheritance**: Hierarchical permission structure
3. **Audit logging**: Track permission usage
4. **Bulk operations**: Permission checks for bulk actions
5. **Custom permissions**: Module-specific custom permissions
