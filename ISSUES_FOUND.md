# Issues Found in College/Department Page

## Critical Issues

### 1. **Case-Sensitive Database Queries** 🔴
**Problem**: Backend uses exact string matching which is case-sensitive.

**Location**: 
- `backend/src/controllers/semester.ts:28` - `WHERE d.name = $1 AND c.name = $2`
- `backend/src/controllers/department.ts:27` - `WHERE c.name = $1`

**Impact**: If database has "Computer Science and Engineering" but frontend sends "Computer science and engineering" (different case), query returns no results.

**Fix Needed**: Use case-insensitive matching with `LOWER()` or `ILIKE`.

---

### 2. **Missing Dependency in useEffect** 🔴
**Problem**: `loadSemesters` depends on both `hierarchy.department` AND `hierarchy.college`, but useEffect only watches `hierarchy.department`.

**Location**: `frontend/src/pages/CollegeDepartment/collegeDepartment.tsx:46-50`

```typescript
// Load semesters when department is selected
useEffect(() => {
  if (hierarchy.department) {
    loadSemesters();  // Uses hierarchy.college too, but not in dependencies!
  }
}, [hierarchy.department]);  // ❌ Missing hierarchy.college!
```

**Impact**: 
- If user changes college but department name stays same, semesters won't reload
- Query might use stale/incorrect college name

**Fix**: Add `hierarchy.college` to dependency array.

---

### 3. **Shared Error State** 🟡
**Problem**: Single `error` state is shared across all three steps (college, department, semester).

**Location**: `frontend/src/pages/CollegeDepartment/collegeDepartment.tsx:31`

**Impact**: 
- Error from one step might show on another step
- Error might not clear properly when moving between steps
- User confusion about which step has the error

**Fix**: Separate error states or clear error when step changes.

---

### 4. **Error Not Cleared on Success** 🟡
**Problem**: When a step succeeds, the error state is not cleared.

**Location**: `frontend/src/pages/CollegeDepartment/collegeDepartment.tsx:65-75`

```typescript
const loadDepartments = async () => {
  try {
    setLoading(true);
    const response = await getDepartmentsByCollegeName(hierarchy.college);
    setDepartments(response.data);
    // ❌ setError('') is missing here - previous error might persist
  } catch (err) {
    console.error('Failed to load departments:', err);
    setError('Failed to load departments');
  } finally {
    setLoading(false);
  }
};
```

**Impact**: Old error messages might persist even after successful operations.

**Fix**: Clear error on success: `setError('')` in try block.

---

### 5. **No Error Logging Details** 🟡
**Problem**: Errors are logged to console but error state only shows generic message.

**Location**: Multiple locations in `collegeDepartment.tsx`

**Impact**: Hard to debug - don't know if it's network error, 404, 500, etc.

**Fix**: Include more details in error message or log to error tracking service.

---

### 6. **Race Condition on Back Navigation** 🟡
**Problem**: When user goes back and changes college, departments load but semesters might still be loading with old college/department.

**Location**: `frontend/src/pages/CollegeDepartment/collegeDepartment.tsx:111-119`

**Impact**: 
- Semesters might show for wrong college briefly
- Data inconsistency

**Fix**: Clear semesters when college/department changes.

---

### 7. **No Loading State for Initial Render** 🟡
**Problem**: When component mounts, `loading` is `false` but colleges are being fetched.

**Location**: `frontend/src/pages/CollegeDepartment/collegeDepartment.tsx:34-36`

**Impact**: Brief flash of "no colleges" before they load.

**Fix**: Set initial loading state to `true` or show skeleton.

---

## Potential Issues

### 8. **No Request Cancellation** 🟡
**Problem**: If user navigates away or changes selection quickly, old requests still complete.

**Impact**: 
- Unnecessary network usage
- State updates after component unmount (React warnings)
- Race conditions

**Fix**: Use AbortController to cancel in-flight requests.

---

### 9. **Missing Error Boundaries** 🟡
**Problem**: No error boundary around the component.

**Impact**: Unhandled errors crash the entire app instead of showing error UI.

**Fix**: Add error boundary component.

---

## Recommended Fixes (Priority Order)

1. **HIGH**: Fix case-sensitive queries (backend) - This is likely the main issue
2. **HIGH**: Fix useEffect dependencies (frontend) - Data inconsistency bug
3. **MEDIUM**: Clear error on success - Better UX
4. **MEDIUM**: Separate error states - Better UX
5. **LOW**: Add request cancellation - Optimization
6. **LOW**: Better error messages - Debugging


