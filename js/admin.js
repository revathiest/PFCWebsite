window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwt');
  const user = PFCDiscord.getUser();
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes('Server Admin');

  if (!token || !isAdmin) {
    window.location.href = '/unauthorized';
    return;
  }

  document.getElementById('logout-btn')?.classList.remove('hidden');
  const nameEl = document.getElementById('display-name');
  if (nameEl) {
    nameEl.textContent = user.displayName;
    nameEl.classList.remove('hidden');
  }
});
