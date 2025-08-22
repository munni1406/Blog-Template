(function () {
  function isLoggedIn() {
    try { return localStorage.getItem('auth_token') === 'ok'; } catch { return false; }
  }

  function login(username, password) {
    // Simple demo auth. Replace with real auth as needed.
    const user = String(username || '').trim();
    const pass = String(password || '').trim();
    if (user && pass) {
      try { localStorage.setItem('auth_token', 'ok'); } catch {}
      return true;
    }
    return false;
  }

  function logout() {
    try { localStorage.removeItem('auth_token'); } catch {}
  }

  function deleteAccount() {
    // Demo: clear all local data for this site
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  }

  function requireAuth(redirect = 'index.html') {
    if (!isLoggedIn()) {
      window.location.replace(redirect);
      return false;
    }
    return true;
  }

  // expose minimal API
  window.Auth = { isLoggedIn, login, logout, requireAuth, deleteAccount };
})();


