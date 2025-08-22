(function () {
  let cachedUser = null;

  async function me() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      cachedUser = data;
      return data;
    } catch {
      return null;
    }
  }

  async function isLoggedIn() {
    const user = cachedUser || await me();
    return Boolean(user && user.ok);
  }

  async function login(username, password) {
    const user = String(username || '').trim();
    const pass = String(password || '').trim();
    if (!user || !pass) return { ok: false, error: 'MISSING_FIELDS' };
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data && data.error || 'LOGIN_FAILED' };
      cachedUser = { ok: true, username: data.username };
      return { ok: true };
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function register(username, password) {
    const user = String(username || '').trim();
    const pass = String(password || '').trim();
    if (!user || !pass) return { ok: false, error: 'MISSING_FIELDS' };
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data && data.error || 'REGISTER_FAILED' };
      cachedUser = { ok: true, username: data.username };
      return { ok: true };
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    cachedUser = null;
  }

  async function deleteAccount() {
    try {
      // Clear any local data for this site
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    } catch {}
    // Ensure server session is cleared
    await logout();
  }

  async function requireAuth(redirect = 'index.html') {
    const ok = await isLoggedIn();
    if (!ok) {
      window.location.replace(redirect);
      return false;
    }
    return true;
  }

  window.Auth = { me, isLoggedIn, login, logout, register, requireAuth, deleteAccount };
})();


