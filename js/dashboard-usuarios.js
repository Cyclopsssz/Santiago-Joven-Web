document.addEventListener('DOMContentLoaded', () => {
  const roleFilter = document.getElementById('role-filter');
  const ageFilter = document.getElementById('age-filter');
  const rows = document.querySelectorAll('.user-row');

  function filterUsers() {
    const selectedRole = roleFilter.value;
    const selectedAge = ageFilter.value;

    rows.forEach(row => {
      const rowRole = row.getAttribute('data-role');
      const rowAge = row.getAttribute('data-age');

      const roleMatch = selectedRole === 'all' || rowRole === selectedRole;
      const ageMatch = selectedAge === 'all' || rowAge === selectedAge;

      if (roleMatch && ageMatch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (roleFilter && ageFilter) {
    roleFilter.addEventListener('change', filterUsers);
    ageFilter.addEventListener('change', filterUsers);
  }
});
