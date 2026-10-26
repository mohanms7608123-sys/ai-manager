export type UserRole = 'Admin' | 'Client' | 'Engineer' | 'Contractor' | 'Worker';

export function getLoginRouteForRole(role?: string | null): string {
  switch (role) {
    case 'Admin': return '/admin/login';
    case 'Client': return '/client/login';
    case 'Engineer': return '/engineer/login';
    case 'Contractor': return '/contractor/login';
    case 'Worker': return '/worker/login';
    default: return '/login';
  }
}

export function performLogout(role?: UserRole | string | null) {
  if (typeof window === 'undefined') return;

  const currentRole = role || localStorage.getItem('userRole') || 'Client';
  const loginUrl = getLoginRouteForRole(currentRole);

  // 1. Clear all localStorage
  try {
    localStorage.clear();
  } catch {}

  // 2. Clear all sessionStorage
  try {
    sessionStorage.clear();
  } catch {}

  // 3. Delete all JWT/Session Cookies
  try {
    const cookiesToClear = [
      'userToken', 
      'jwtToken', 
      'authSession', 
      'userRole', 
      'userEmail', 
      'isAuthed',
      'workerData', 
      'attendanceToday', 
      'projectsCache', 
      'notifCache'
    ];

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });

    // Clear any remaining cookies
    const allCookies = document.cookie.split(';');
    for (let i = 0; i < allCookies.length; i++) {
      const cookie = allCookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  } catch {}

  // 4. Replace window location to wipe history entry (prevents Back button navigation to dashboard)
  window.location.replace(loginUrl);
}

export function setAuthSession(role: UserRole, email: string, additionalData?: any) {
  if (typeof window === 'undefined') return;

  // 1. Clear stale caches
  try {
    localStorage.removeItem('projectsCache');
    localStorage.removeItem('notifCache');
  } catch {}

  // 2. Resolve user name from registered users or email
  let resolvedName = localStorage.getItem('userName');
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
    const registered = registeredUsers[email.toLowerCase().trim()];
    if (registered && (registered.fullName || registered.name)) {
      resolvedName = registered.fullName || registered.name;
    }
  } catch {}

  if (!resolvedName) {
    const derivedFromEmail = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    resolvedName = derivedFromEmail || `${role} User`;
  }

  // 3. Set localStorage
  localStorage.setItem('isAuthed', 'true');
  localStorage.setItem('authSession', 'active');
  localStorage.setItem('userRole', role);
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userName', resolvedName);
  localStorage.setItem('userToken', `jwt-session-${role.toLowerCase()}-${Date.now()}`);

  if (additionalData && role === 'Worker') {
    localStorage.setItem('workerData', JSON.stringify(additionalData));
  }

  // 4. Set Cookies (7 days expiry)
  const maxAge = 86400 * 7;
  document.cookie = `authSession=active; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `isAuthed=true; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `userRole=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `userEmail=${email}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `userName=${encodeURIComponent(resolvedName)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `userToken=jwt-session-${role.toLowerCase()}-${Date.now()}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function checkIsAuthenticated(requiredRole?: UserRole): boolean {
  if (typeof window === 'undefined') return false;

  const isAuthed = localStorage.getItem('isAuthed') === 'true' || localStorage.getItem('authSession') === 'active';
  const role = localStorage.getItem('userRole') as UserRole;
  const token = localStorage.getItem('userToken') || localStorage.getItem('jwtToken');

  const hasCookie = document.cookie.includes('authSession=active') || document.cookie.includes('isAuthed=true');

  if (!isAuthed && !token && !hasCookie) {
    return false;
  }

  if (requiredRole && role !== requiredRole) {
    return false;
  }

  return true;
}
