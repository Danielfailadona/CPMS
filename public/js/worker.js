document.addEventListener('DOMContentLoaded', function() {
    // Initialize CRUD helpers
    const taskCrud = new CrudHelper('tasks');
    const complaintCrud = new CrudHelper('complaints');
    const uploadCrud = new CrudHelper('uploads');

    // Get form elements
    const taskForm = document.getElementById('taskForm');
    const uploadForm = document.getElementById('uploadForm');
    const submitTaskBtn = document.getElementById('submitTaskBtn');
    const clearTaskFormBtn = document.getElementById('clearTaskFormBtn');
    const loadTasksBtn = document.getElementById('loadTasksBtn');
    const loadComplaintsBtn = document.getElementById('loadComplaintsBtn');
    const loadUploadsBtn = document.getElementById('loadUploadsBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    
    // Get list containers
    const tasksList = document.getElementById('tasks-list');
    const complaintsList = document.getElementById('complaints-list');
    const uploadsList = document.getElementById('uploads-list');

    // Load data
    loadTasksBtn.addEventListener('click', loadTasks);
    loadComplaintsBtn.addEventListener('click', loadComplaints);
    loadUploadsBtn.addEventListener('click', loadUploads);
    clearTaskFormBtn.addEventListener('click', resetTaskForm);
    clearFormBtn.addEventListener('click', resetForm);

    // Handle task submission
    taskForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        submitTaskBtn.disabled = true;
        submitTaskBtn.textContent = 'Sending...';

        try {
            const taskData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                due_date: formData.get('due_date') || null,
                worker_id: getCurrentUserId(),
                foreman_id: 1 // Assuming foreman ID is 1
            };

            const result = await taskCrud.create(taskData);

            if (result.success) {
                alert('Task sent to foreman successfully!');
                resetTaskForm();
                loadTasks();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending task: ' + error.message);
        } finally {
            submitTaskBtn.disabled = false;
            submitTaskBtn.textContent = 'Send Task';
        }
    });

    // Handle file upload (same as foreman)
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadResponse = await fetch('/upload-file-test', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: uploadFormData
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.message || 'File upload failed');
            }

            const uploadData = {
                filename: file.name,
                file_path: uploadResult.path,
                file_size: formatFileSize(file.size),
                mime_type: file.type,
                upload_type: formData.get('upload_type'),
                title: formData.get('title') || file.name,
                description: formData.get('description'),
                is_public: formData.get('is_public') ? true : false,
                user_id: getCurrentUserId()
            };

            const result = await uploadCrud.create(uploadData);

            if (result.success) {
                alert('File uploaded successfully!');
                resetForm();
                loadUploads();
            } else {
                alert('Error saving file info: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading file: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload File';
        }
    });

    async function loadComplaints() {
        try {
            const complaints = await complaintCrud.readAll();
            
            if (complaints.length === 0) {
                complaintsList.innerHTML = '<p class="no-complaints">No complaints to display.</p>';
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
                            <span class="complaint-client">Client ID: ${complaint.client_id}</span>
                        </div>
                        <div class="complaint-description">${complaint.description}</div>
                        ${complaint.worker_notes ? `<div class="worker-notes"><strong>My Notes:</strong> ${complaint.worker_notes}</div>` : ''}
                    </div>
                    <div class="complaint-actions">
                        ${complaint.status !== 'resolved' && complaint.status !== 'closed' ? `
                            <button class="action-btn" onclick="updateComplaintStatus(${complaint.id}, 'in_progress')">Take Action</button>
                            <button class="resolve-btn" onclick="resolveComplaint(${complaint.id})">Mark Resolved</button>
                        ` : ''}
                        <button class="notes-btn" onclick="addWorkerNotes(${complaint.id})">Add Notes</button>
                    </div>
                </div>
            `).join('');
            
            complaintsList.innerHTML = complaintsHTML;
        } catch (error) {
            console.error('Error loading complaints:', error);
            complaintsList.innerHTML = '<p class="no-complaints">Error loading complaints.</p>';
        }
    }

    async function loadUploads() {
        try {
            const uploads = await uploadCrud.readAll();
            const currentUserId = getCurrentUserId();
            
            const userUploads = uploads.filter(upload => upload.user_id == currentUserId);
            
            if (userUploads.length === 0) {
                uploadsList.innerHTML = '<p class="no-uploads">No files uploaded yet.</p>';
                return;
            }
            
            const uploadsHTML = userUploads.map(upload => `
                <div class="upload-item" data-id="${upload.id}">
                    <div class="upload-info">
                        <div class="upload-title">${upload.title || upload.filename}</div>
                        <div class="upload-details">
                            <span class="upload-type">${getUploadTypeLabel(upload.upload_type)}</span>
                            <span class="upload-size">${upload.file_size}</span>
                            <span class="upload-date">${new Date(upload.created_at).toLocaleDateString()}</span>
                            <span class="${upload.is_public ? 'upload-public' : 'upload-private'}">
                                ${upload.is_public ? 'Public' : 'Private'}
                            </span>
                        </div>
                        ${upload.description ? `<div class="upload-description">${upload.description}</div>` : ''}
                    </div>
                    <div class="upload-actions">
                        <button class="download-btn" onclick="downloadUpload(event, ${upload.id}, '${upload.filename}')">Download</button>
                        <button class="view-btn" onclick="viewUpload(${upload.id})">View</button>
                        <button class="delete-btn" onclick="deleteUpload(${upload.id})">Delete</button>
                    </div>
                </div>
            `).join('');
            
            uploadsList.innerHTML = uploadsHTML;
        } catch (error) {
            console.error('Error loading uploads:', error);
            uploadsList.innerHTML = '<p class="no-uploads">Error loading files.</p>';
        }
    }

    // Update complaint status
    window.updateComplaintStatus = async function(id, status) {
        try {
            const result = await complaintCrud.update(id, { status: status });
            
            if (result.success) {
                alert(`Complaint status updated to ${status.replace('_', ' ')}!`);
                loadComplaints();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating complaint:', error);
            alert('Error updating complaint: ' + error.message);
        }
    };

    // Resolve complaint
    window.resolveComplaint = async function(id) {
        const notes = prompt('Add resolution notes (optional):');
        
        try {
            const updateData = {
                status: 'resolved',
                resolved_at: new Date().toISOString()
            };
            
            if (notes) {
                updateData.worker_notes = notes;
            }
            
            const result = await complaintCrud.update(id, updateData);
            
            if (result.success) {
                alert('Complaint marked as resolved!');
                loadComplaints();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error resolving complaint:', error);
            alert('Error resolving complaint: ' + error.message);
        }
    };

    // Add worker notes
    window.addWorkerNotes = async function(id) {
        const notes = prompt('Enter your notes:');
        
        if (notes) {
            try {
                const result = await complaintCrud.update(id, { worker_notes: notes });
                
                if (result.success) {
                    alert('Notes added successfully!');
                    loadComplaints();
                } else {
                    alert('Error: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding notes:', error);
                alert('Error adding notes: ' + error.message);
            }
        }
    };

    // File management functions (same as foreman)
    window.downloadUpload = async function(event, id, filename) {
        try {
            const result = await uploadCrud.readOne(id);
            
            if (result.success) {
                const upload = result.data;
                
                const originalText = event.target.textContent;
                event.target.textContent = 'Downloading...';
                event.target.disabled = true;
                
                try {
                    const response = await fetch(`/download-file?path=${encodeURIComponent(upload.file_path)}&filename=${encodeURIComponent(upload.filename)}`);
                    
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    
                    if (blob.size === 0) {
                        throw new Error('File is empty or not found');
                    }
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = upload.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                } catch (error) {
                    console.error('Download error:', error);
                    try {
                        window.open(`/download-file?path=${encodeURIComponent(upload.file_path)}&filename=${encodeURIComponent(upload.filename)}`, '_blank');
                    } catch (fallbackError) {
                        alert('Error downloading file: ' + error.message);
                    }
                } finally {
                    event.target.textContent = originalText;
                    event.target.disabled = false;
                }
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file: ' + error.message);
        }
    };

    window.viewUpload = async function(id) {
        const result = await uploadCrud.readOne(id);
        
        if (result.success) {
            const upload = result.data;
            const publicStatus = upload.is_public ? 'Public' : 'Private';
            
            alert(`File Details:\n\nTitle: ${upload.title}\nFilename: ${upload.filename}\nType: ${getUploadTypeLabel(upload.upload_type)}\nSize: ${upload.file_size}\nPublic: ${publicStatus}\nUploaded: ${new Date(upload.created_at).toLocaleString()}\nDescription: ${upload.description || 'None'}`);
        }
    };

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

    function resetForm() {
        uploadForm.reset();
        document.getElementById('is_public').checked = false;
    }

    function getCurrentUserId() {
        return 1; // Replace with actual user ID from session
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getUploadTypeLabel(type) {
        const types = {
            'task': 'Task',
            'image': 'Image',
            'report': 'Work Report',
            'safety': 'Safety',
            'inspection': 'Inspection',
            'other': 'Other'
        };
        return types[type] || type;
    }

    async function loadTasks() {
        try {
            const tasks = await taskCrud.readAll();
            const currentUserId = getCurrentUserId();
            
            const userTasks = tasks.filter(task => task.worker_id == currentUserId);
            
            if (userTasks.length === 0) {
                tasksList.innerHTML = '<p class="no-tasks">No tasks sent yet.</p>';
                return;
            }
            
            const tasksHTML = userTasks.map(task => `
                <div class="task-item" data-id="${task.id}">
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-details">
                            <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                            <span class="task-status status-${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span>
                            <span class="task-date">${new Date(task.created_at).toLocaleDateString()}</span>
                            ${task.due_date ? `<span class="task-due">Due: ${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
                        </div>
                        <div class="task-description">${task.description}</div>
                        ${task.foreman_notes ? `<div class="foreman-notes"><strong>Foreman Notes:</strong> ${task.foreman_notes}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                    </div>
                </div>
            `).join('');
            
            tasksList.innerHTML = tasksHTML;
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasksList.innerHTML = '<p class="no-tasks">Error loading tasks.</p>';
        }
    }

    // Edit task
    window.editTask = async function(id) {
        try {
            const result = await taskCrud.readOne(id);
            
            if (result.success) {
                const task = result.data;
                
                const newTitle = prompt('Edit Task Title:', task.title);
                if (newTitle === null) return;
                
                const newDescription = prompt('Edit Task Description:', task.description);
                if (newDescription === null) return;
                
                const newPriority = prompt('Edit Priority (low/medium/high/urgent):', task.priority);
                if (newPriority === null) return;
                
                const updateData = {
                    title: newTitle,
                    description: newDescription,
                    priority: newPriority
                };
                
                const updateResult = await taskCrud.update(id, updateData);
                
                if (updateResult.success) {
                    alert('Task updated successfully!');
                    loadTasks();
                } else {
                    alert('Error: ' + (updateResult.message || 'Unknown error'));
                }
            }
        } catch (error) {
            console.error('Error editing task:', error);
            alert('Error editing task: ' + error.message);
        }
    };

    // Delete task
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

    function resetTaskForm() {
        taskForm.reset();
        document.getElementById('task_priority').value = 'medium';
    }

    // Navigation function
    window.showSection = function(section) {
        // Hide all sections
        document.getElementById('tasks-section').style.display = 'none';
        document.getElementById('send-task-section').style.display = 'none';
        document.getElementById('complaints-section').style.display = 'none';
        document.getElementById('files-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'none';
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        if (section === 'tasks') {
            document.getElementById('tasks-section').style.display = 'block';
            event.target.classList.add('active');
            loadTasks();
        } else if (section === 'send-task') {
            document.getElementById('send-task-section').style.display = 'block';
            event.target.classList.add('active');
        } else if (section === 'complaints') {
            document.getElementById('complaints-section').style.display = 'block';
            event.target.classList.add('active');
            loadComplaints();
        } else if (section === 'files') {
            document.getElementById('files-section').style.display = 'block';
            event.target.classList.add('active');
            loadUploads();
        } else if (section === 'upload') {
            document.getElementById('upload-section').style.display = 'block';
            event.target.classList.add('active');
        }
    };

    // Load data on page load
    loadTasks();
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