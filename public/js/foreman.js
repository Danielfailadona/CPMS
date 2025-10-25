document.addEventListener('DOMContentLoaded', function() {
    // Initialize CRUD helpers
    const taskCrud = new CrudHelper('tasks');
    const uploadCrud = new CrudHelper('uploads');
    
    const form = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const loadTasksBtn = document.getElementById('loadTasksBtn');
    const loadUploadsBtn = document.getElementById('loadUploadsBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const tasksList = document.getElementById('tasks-list');
    const uploadsList = document.getElementById('uploads-list');

    // Load data
    loadTasksBtn.addEventListener('click', loadTasks);
    loadUploadsBtn.addEventListener('click', loadUploads);

    // Clear form
    clearFormBtn.addEventListener('click', resetForm);

    // ==================== STEP 5: UPDATED UPLOAD HANDLER ====================
    // Handle file upload - IMPROVED version that actually stores files
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        // Show loading state
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        try {
            // First, upload the actual file
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

            // Then save file info to database
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
                alert('File uploaded and saved successfully!');
                resetForm();
                loadUploads();
            } else {
                alert('Error saving file info: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading file: ' + error.message);
        } finally {
            // Reset button state
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload File';
        }
    });
    // ==================== END STEP 5 ====================

    async function loadUploads() {
        try {
            const uploads = await uploadCrud.readAll();
            const currentUserId = getCurrentUserId();
            
            // Filter to show only current user's uploads
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

    // Download upload - REAL version
    window.downloadUpload = async function(event, id, filename) {
        try {
            const result = await uploadCrud.readOne(id);
            
            if (result.success) {
                const upload = result.data;
                
                // Show loading
                const originalText = event.target.textContent;
                event.target.textContent = 'Downloading...';
                event.target.disabled = true;
                
                // Download the actual file
                try {
                    const response = await fetch(`/download-file?path=${encodeURIComponent(upload.file_path)}&filename=${encodeURIComponent(upload.filename)}`);
                    
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                    }
                    
                    const blob = await response.blob();
                    
                    // Check if blob is empty
                    if (blob.size === 0) {
                        throw new Error('File is empty or not found');
                    }
                    
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = upload.filename; // Use original filename
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log('File downloaded successfully:', upload.filename);
                    
                } catch (error) {
                    console.error('Download error:', error);
                    
                    // Fallback: Try to open in new tab if download fails
                    try {
                        window.open(`/download-file?path=${encodeURIComponent(upload.file_path)}&filename=${encodeURIComponent(upload.filename)}`, '_blank');
                    } catch (fallbackError) {
                        alert('Error downloading file: ' + error.message + '\n\nNote: The file might not exist on the server yet since we\'re only storing file information in the database.');
                    }
                } finally {
                    // Reset button
                    event.target.textContent = originalText;
                    event.target.disabled = false;
                }
                
            } else {
                alert('Error: Could not find file to download');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Error downloading file: ' + error.message);
        }
    };

    // View upload details
    window.viewUpload = async function(id) {
        const result = await uploadCrud.readOne(id);
        
        if (result.success) {
            const upload = result.data;
            const publicStatus = upload.is_public ? 'Public' : 'Private';
            
            alert(`File Details:\n\nTitle: ${upload.title}\nFilename: ${upload.filename}\nType: ${getUploadTypeLabel(upload.upload_type)}\nSize: ${upload.file_size}\nPublic: ${publicStatus}\nUploaded: ${new Date(upload.created_at).toLocaleString()}\nDescription: ${upload.description || 'None'}\nFile Path: ${upload.file_path}\n\nClick "Download" to get the file.`);
        }
    };

    // Delete upload
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
        form.reset();
        document.getElementById('is_public').checked = false;
    }

    // Helper function to get current user ID
    function getCurrentUserId() {
        // This should come from your authentication system
        // For now, we'll return a placeholder
        // In a real app, you'd get this from the session or JWT token
        return 1; // Replace with actual user ID from session
    }

    // Helper function to format file size
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Helper function to get upload type label
    function getUploadTypeLabel(type) {
        const types = {
            'task': 'Task',
            'image': 'Image',
            'report': 'Report',
            'document': 'Document',
            'blueprint': 'Blueprint',
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
            
            // Show tasks assigned to this foreman
            const foremanTasks = tasks.filter(task => task.foreman_id == currentUserId);
            
            if (foremanTasks.length === 0) {
                tasksList.innerHTML = '<p class="no-tasks">No tasks from workers.</p>';
                return;
            }
            
            const tasksHTML = foremanTasks.map(task => `
                <div class="task-item" data-id="${task.id}">
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-details">
                            <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                            <span class="task-status status-${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span>
                            <span class="task-date">${new Date(task.created_at).toLocaleDateString()}</span>
                            ${task.due_date ? `<span class="task-due">Due: ${new Date(task.due_date).toLocaleDateString()}</span>` : ''}
                            <span class="task-worker">From Worker ID: ${task.worker_id}</span>
                        </div>
                        <div class="task-description">${task.description}</div>
                        ${task.foreman_notes ? `<div class="foreman-notes"><strong>My Notes:</strong> ${task.foreman_notes}</div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="action-btn" onclick="updateTaskStatus(${task.id}, 'in_progress')">Start Task</button>
                        <button class="resolve-btn" onclick="completeTask(${task.id})">Complete</button>
                        <button class="notes-btn" onclick="addForemanNotes(${task.id})">Add Notes</button>
                    </div>
                </div>
            `).join('');
            
            tasksList.innerHTML = tasksHTML;
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasksList.innerHTML = '<p class="no-tasks">Error loading tasks.</p>';
        }
    }

    // Update task status
    window.updateTaskStatus = async function(id, status) {
        try {
            const result = await taskCrud.update(id, { status: status });
            
            if (result.success) {
                alert(`Task status updated to ${status.replace('_', ' ')}!`);
                loadTasks();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error updating task: ' + error.message);
        }
    };

    // Complete task
    window.completeTask = async function(id) {
        const notes = prompt('Add completion notes (optional):');
        
        try {
            const updateData = {
                status: 'completed',
                completed_at: new Date().toISOString()
            };
            
            if (notes) {
                updateData.foreman_notes = notes;
            }
            
            const result = await taskCrud.update(id, updateData);
            
            if (result.success) {
                alert('Task marked as completed!');
                loadTasks();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error completing task:', error);
            alert('Error completing task: ' + error.message);
        }
    };

    // Add foreman notes
    window.addForemanNotes = async function(id) {
        const notes = prompt('Enter your notes:');
        
        if (notes) {
            try {
                const result = await taskCrud.update(id, { foreman_notes: notes });
                
                if (result.success) {
                    alert('Notes added successfully!');
                    loadTasks();
                } else {
                    alert('Error: ' + (result.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding notes:', error);
                alert('Error adding notes: ' + error.message);
            }
        }
    };

    // Navigation function
    window.showSection = function(section) {
        // Hide all sections
        document.getElementById('tasks-section').style.display = 'none';
        document.getElementById('files-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'none';
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        if (section === 'tasks') {
            document.getElementById('tasks-section').style.display = 'block';
            event.target.classList.add('active');
            loadTasks();
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