document.addEventListener('DOMContentLoaded', function() {
    // Initialize generic CRUD helper for users table
    const userCrud = new CrudHelper('users');
    
    const form = document.getElementById('userForm');
    const createBtn = document.getElementById('createBtn');
    const updateBtn = document.getElementById('updateBtn');
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    const clearBtn = document.getElementById('clearBtn');
    const usersList = document.getElementById('users-list');

    let currentEditingId = null;

    // Create or Update user
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            user_type: formData.get('user_type'),
            is_authorized: formData.get('is_authorized') ? true : false,
            is_active: formData.get('is_active') ? true : false,
            authorization_notes: formData.get('authorization_notes')
        };

        // Only include password if provided
        const password = formData.get('password');
        if (password) {
            data.password = password;
        }

        try {
            let result;
            if (currentEditingId) {
                result = await userCrud.update(currentEditingId, data);
            } else {
                // For new users, password is required
                if (!password) {
                    alert('Password is required for new users');
                    return;
                }
                result = await userCrud.create(data);
            }

            if (result.success) {
                alert(result.message);
                resetForm();
                loadUsers();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing request');
        }
    });

    // Update button click handler
    updateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    });

    // Load all users
    loadUsersBtn.addEventListener('click', loadUsers);

    // Clear form
    clearBtn.addEventListener('click', resetForm);

    async function loadUsers() {
        const users = await userCrud.readAll();
        
        if (users.length === 0) {
            usersList.innerHTML = '<p class="no-users">No users found in the system.</p>';
            return;
        }
        
        const usersHTML = users.map(user => `
            <div class="user-item" data-id="${user.id}">
                <div class="user-info">
                    <strong>${user.name}</strong> 
                    <span class="user-email">(${user.email})</span>
                    <span class="user-type ${user.user_type}">${user.user_type.toUpperCase()}</span>
                    <span class="user-status ${user.is_authorized ? 'authorized' : 'pending'}">
                        ${user.is_authorized ? '✓ Authorized' : '⏳ Pending'}
                    </span>
                    <span class="user-active ${user.is_active ? 'active' : 'inactive'}">
                        ${user.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                </div>
                <div class="user-actions">
                    <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
                    <button class="toggle-auth-btn ${user.is_authorized ? 'unauth' : 'auth'}" onclick="toggleAuthorization(${user.id}, ${user.is_authorized})">
                        ${user.is_authorized ? 'Unauthorize' : 'Authorize'}
                    </button>
                    <button class="toggle-active-btn ${user.is_active ? 'deactivate' : 'activate'}" onclick="toggleActive(${user.id}, ${user.is_active})">
                        ${user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
        usersList.innerHTML = usersHTML;
    }

    // Edit user - load all user data into form
    window.editUser = async function(id) {
        const result = await userCrud.readOne(id);
        
        if (result.success) {
            const user = result.data;
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('user_type').value = user.user_type;
            document.getElementById('is_authorized').checked = user.is_authorized;
            document.getElementById('is_active').checked = user.is_active;
            document.getElementById('authorization_notes').value = user.authorization_notes || '';
            document.getElementById('password').value = '';
            document.getElementById('password').placeholder = 'Leave blank to keep current password';
            document.getElementById('password').required = false;
            
            currentEditingId = user.id;
            document.getElementById('user_id').value = user.id;
            
            createBtn.style.display = 'none';
            updateBtn.style.display = 'inline-block';
        }
    };

    // Toggle user authorization
    window.toggleAuthorization = async function(id, currentlyAuthorized) {
        const action = currentlyAuthorized ? 'unauthorize' : 'authorize';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                const result = await userCrud.update(id, {
                    is_authorized: !currentlyAuthorized,
                    authorization_notes: `${action}d by admin on ${new Date().toLocaleString()}`
                });
                
                if (result.success) {
                    alert(`User ${action}d successfully!`);
                    loadUsers();
                } else {
                    alert('Error: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                alert('Error updating user authorization');
            }
        }
    };

    // Toggle user active status
    window.toggleActive = async function(id, currentlyActive) {
        const action = currentlyActive ? 'deactivate' : 'activate';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                const result = await userCrud.update(id, {
                    is_active: !currentlyActive
                });
                
                if (result.success) {
                    alert(`User ${action}d successfully!`);
                    loadUsers();
                } else {
                    alert('Error: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                alert('Error updating user status');
            }
        }
    };

    // Delete user
    window.deleteUser = async function(id) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const result = await userCrud.delete(id);
            
            if (result.success) {
                alert(result.message);
                loadUsers();
                if (currentEditingId === id) {
                    resetForm();
                }
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        }
    };

    // View user details
    window.viewUser = async function(id) {
        const result = await userCrud.readOne(id);
        
        if (result.success) {
            const user = result.data;
            const status = user.is_authorized ? 'Authorized' : 'Pending Authorization';
            const active = user.is_active ? 'Active' : 'Inactive';
            
            alert(`User Details:\n\nID: ${user.id}\nName: ${user.name}\nEmail: ${user.email}\nType: ${user.user_type}\nStatus: ${status}\nActive: ${active}\nCreated: ${new Date(user.created_at).toLocaleString()}\nNotes: ${user.authorization_notes || 'None'}`);
        }
    };

    function resetForm() {
        form.reset();
        currentEditingId = null;
        document.getElementById('user_id').value = '';
        document.getElementById('password').required = true;
        document.getElementById('password').placeholder = '';
        document.getElementById('is_active').checked = true;
        createBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
    }

    // Load users on page load
    loadUsers();
});

// Logout function
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Logged out successfully!');
                window.location.href = '/login';
            }
        } catch (error) {
            alert('Logout failed. Please try again.');
        }
    }
}