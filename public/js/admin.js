document.addEventListener('DOMContentLoaded', function() {
    // Initialize CRUD helpers for all tables
    const userCrud = new CrudHelper('users');
    const uploadCrud = new CrudHelper('uploads');
    const taskCrud = new CrudHelper('tasks');
    const complaintCrud = new CrudHelper('complaints');
    
    const form = document.getElementById('userForm');
    const createBtn = document.getElementById('createBtn');
    const updateBtn = document.getElementById('updateBtn');
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    const loadUploadsBtn = document.getElementById('loadUploadsBtn');
    const loadTasksBtn = document.getElementById('loadTasksBtn');
    const loadComplaintsBtn = document.getElementById('loadComplaintsBtn');
    const clearBtn = document.getElementById('clearBtn');
    const usersList = document.getElementById('users-list');
    const uploadsList = document.getElementById('uploads-list');
    const tasksList = document.getElementById('tasks-list');
    const complaintsList = document.getElementById('complaints-list');

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

    // Load data event listeners
    loadUsersBtn.addEventListener('click', loadUsers);
    loadUploadsBtn.addEventListener('click', loadUploads);
    loadTasksBtn.addEventListener('click', loadTasks);
    loadComplaintsBtn.addEventListener('click', loadComplaints);

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

    // Navigation function
    window.showSection = function(section) {
        // Hide all sections
        document.getElementById('users-section').style.display = 'none';
        document.getElementById('user-form-section').style.display = 'none';
        document.getElementById('uploads-section').style.display = 'none';
        document.getElementById('tasks-section').style.display = 'none';
        document.getElementById('complaints-section').style.display = 'none';
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        if (section === 'users') {
            document.getElementById('users-section').style.display = 'block';
            document.getElementById('user-form-section').style.display = 'block';
            event.target.classList.add('active');
            loadUsers();
        } else if (section === 'uploads') {
            document.getElementById('uploads-section').style.display = 'block';
            event.target.classList.add('active');
            loadUploads();
        } else if (section === 'tasks') {
            document.getElementById('tasks-section').style.display = 'block';
            event.target.classList.add('active');
            loadTasks();
        } else if (section === 'complaints') {
            document.getElementById('complaints-section').style.display = 'block';
            event.target.classList.add('active');
            loadComplaints();
        }
    };

    // Load uploads function
    async function loadUploads() {
        const uploads = await uploadCrud.readAll();
        
        if (uploads.length === 0) {
            uploadsList.innerHTML = '<p class="no-uploads">No files found.</p>';
            return;
        }
        
        const uploadsHTML = uploads.map(upload => `
            <div class="upload-item" data-id="${upload.id}">
                <div class="upload-info">
                    <div class="upload-title">${upload.title || upload.filename}</div>
                    <div class="upload-details">
                        <span class="upload-type">${upload.upload_type}</span>
                        <span class="upload-size">${upload.file_size}</span>
                        <span class="upload-date">${new Date(upload.created_at).toLocaleDateString()}</span>
                        <span class="upload-user">User: ${upload.user_id}</span>
                    </div>
                </div>
                <div class="upload-actions">
                    <button class="view-btn" onclick="viewUpload(${upload.id})">View</button>
                    <button class="delete-btn" onclick="deleteUpload(${upload.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
        uploadsList.innerHTML = uploadsHTML;
    }

    // Load tasks function
    async function loadTasks() {
        const tasks = await taskCrud.readAll();
        
        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="no-tasks">No tasks found.</p>';
            return;
        }
        
        const tasksHTML = tasks.map(task => `
            <div class="task-item" data-id="${task.id}">
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    <div class="task-details">
                        <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                        <span class="task-status status-${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span>
                        <span class="task-date">${new Date(task.created_at).toLocaleDateString()}</span>
                        <span class="task-worker">Staff: ${task.worker_id}</span>
                        <span class="task-foreman">Foreman: ${task.foreman_id}</span>
                    </div>
                    <div class="task-description">${task.description}</div>
                </div>
                <div class="task-actions">
                    <button class="view-btn" onclick="viewTask(${task.id})">View</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
        tasksList.innerHTML = tasksHTML;
    }

    // Load complaints function
    async function loadComplaints() {
        const complaints = await complaintCrud.readAll();
        
        if (complaints.length === 0) {
            complaintsList.innerHTML = '<p class="no-complaints">No complaints found.</p>';
            return;
        }
        
        const complaintsHTML = complaints.map(complaint => `
            <div class="complaint-item" data-id="${complaint.id}">
                <div class="complaint-info">
                    <div class="complaint-title">${complaint.title}</div>
                    <div class="complaint-details">
                        <span class="complaint-priority priority-${complaint.priority}">${complaint.priority.toUpperCase()}</span>
                        <span class="complaint-status status-${complaint.status}">${complaint.status.replace('_', ' ').toUpperCase()}</span>
                        <span class="complaint-date">${new Date(complaint.created_at).toLocaleDateString()}</span>
                        <span class="complaint-client">Client: ${complaint.client_id}</span>
                    </div>
                    <div class="complaint-description">${complaint.description}</div>
                </div>
                <div class="complaint-actions">
                    <button class="view-btn" onclick="viewComplaint(${complaint.id})">View</button>
                    <button class="delete-btn" onclick="deleteComplaint(${complaint.id})">Delete</button>
                </div>
            </div>
        `).join('');
        
        complaintsList.innerHTML = complaintsHTML;
    }

    // View functions for other tables
    window.viewUpload = async function(id) {
        const result = await uploadCrud.readOne(id);
        if (result.success) {
            const upload = result.data;
            alert(`File Details:\n\nTitle: ${upload.title}\nFilename: ${upload.filename}\nType: ${upload.upload_type}\nSize: ${upload.file_size}\nUser ID: ${upload.user_id}\nUploaded: ${new Date(upload.created_at).toLocaleString()}`);
        }
    };

    window.viewTask = async function(id) {
        const result = await taskCrud.readOne(id);
        if (result.success) {
            const task = result.data;
            alert(`Task Details:\n\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nStatus: ${task.status}\nStaff ID: ${task.worker_id}\nForeman ID: ${task.foreman_id}\nCreated: ${new Date(task.created_at).toLocaleString()}`);
        }
    };

    window.viewComplaint = async function(id) {
        const result = await complaintCrud.readOne(id);
        if (result.success) {
            const complaint = result.data;
            alert(`Complaint Details:\n\nTitle: ${complaint.title}\nDescription: ${complaint.description}\nPriority: ${complaint.priority}\nStatus: ${complaint.status}\nClient ID: ${complaint.client_id}\nCreated: ${new Date(complaint.created_at).toLocaleString()}`);
        }
    };

    // Delete functions for other tables
    window.deleteUpload = async function(id) {
        if (confirm('Are you sure you want to delete this file?')) {
            const result = await uploadCrud.delete(id);
            if (result.success) {
                alert('File deleted successfully!');
                loadUploads();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        }
    };

    window.deleteTask = async function(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const result = await taskCrud.delete(id);
            if (result.success) {
                alert('Task deleted successfully!');
                loadTasks();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        }
    };

    window.deleteComplaint = async function(id) {
        if (confirm('Are you sure you want to delete this complaint?')) {
            const result = await complaintCrud.delete(id);
            if (result.success) {
                alert('Complaint deleted successfully!');
                loadComplaints();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        }
    };

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