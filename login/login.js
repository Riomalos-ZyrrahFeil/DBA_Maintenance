function selectRole(role) {
    const roleSelector = document.getElementById('roleSelector');
    const loginForm = document.getElementById('loginForm');
    const selectedRoleInput = document.getElementById('selectedRole');
    const roleLabel = document.getElementById('roleLabel');

    if (roleSelector && loginForm && selectedRoleInput && roleLabel) {
        roleSelector.classList.add('hidden');
        loginForm.classList.add('active-form');
        selectedRoleInput.value = role;
        roleLabel.innerText = role.charAt(0).toUpperCase() + role.slice(1);
    }
}

function resetRole() {  
    const roleSelector = document.getElementById('roleSelector');
    const loginForm = document.getElementById('loginForm');

    if (roleSelector && loginForm) {
        roleSelector.classList.remove('hidden');
        loginForm.classList.remove('active-form');
    }
}