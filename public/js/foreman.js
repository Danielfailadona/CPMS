document.addEventListener('DOMContentLoaded', function() {
    // Initialize CRUD helpers
    const taskCrud = new CrudHelper('tasks');
    const uploadCrud = new CrudHelper('uploads');
    const userCrud = new CrudHelper('users');
    
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
    document.getElementById('loadAllFilesBtn').addEventListener('click', loadAllFiles);
    
    // Filter functionality
    document.getElementById('apply-filters').addEventListener('click', () => loadUploads(true));
    document.getElementById('apply-all-filters').addEventListener('click', () => loadAllFiles(true));
    document.getElementById('search-files').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') loadUploads(true);
    });
    document.getElementById('search-all-files').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') loadAllFiles(true);
    });

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
                user_id: await getCurrentUserId()
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

    async function loadUploads(applyFilters = false) {
        try {
            const uploads = await uploadCrud.readAll();
            const currentUserId = await getCurrentUserId();
            
            // Filter to show only current user's uploads
            let userUploads = uploads.filter(upload => upload.user_id == currentUserId);
            
            // Apply search and type filters
            if (applyFilters) {
                const searchTerm = document.getElementById('search-files').value.toLowerCase();
                const typeFilter = document.getElementById('filter-type').value;
                
                if (searchTerm) {
                    userUploads = userUploads.filter(upload => 
                        (upload.title && upload.title.toLowerCase().includes(searchTerm)) ||
                        (upload.filename && upload.filename.toLowerCase().includes(searchTerm))
                    );
                }
                
                if (typeFilter !== 'all') {
                    userUploads = userUploads.filter(upload => upload.upload_type === typeFilter);
                }
            }
            
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
    let currentUserId = null;
    
    async function getCurrentUserId() {
        if (currentUserId === null) {
            try {
                const response = await fetch('/current-user');
                const result = await response.json();
                if (result.success) {
                    currentUserId = result.user.id;
                } else {
                    currentUserId = 1; // fallback
                }
            } catch (error) {
                console.error('Error getting current user:', error);
                currentUserId = 1; // fallback
            }
        }
        return currentUserId;
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
            const [tasks, users, currentUserId] = await Promise.all([
                taskCrud.readAll(),
                userCrud.readAll(),
                getCurrentUserId()
            ]);
            
            // Show tasks assigned to this foreman
            const foremanTasks = tasks.filter(task => task.foreman_id == currentUserId);
            
            // Add staff names to tasks
            foremanTasks.forEach(task => {
                const staff = users.find(user => user.id == task.worker_id);
                task.staff_name = staff ? staff.name : 'Unknown Staff';
            });
            
            if (foremanTasks.length === 0) {
                tasksList.innerHTML = '<p class="no-tasks">No tasks from staff.</p>';
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
                            <span class="task-staff">From: ${task.staff_name}</span>
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
        document.getElementById('all-files-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'none';
        document.getElementById('camera-section').style.display = 'none';
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        if (section === 'tasks') {
            if (document.getElementById('tasks-section')) {
                document.getElementById('tasks-section').style.display = 'block';
                loadTasks();
            }
            event.target.classList.add('active');
        } else if (section === 'files') {
            document.getElementById('files-section').style.display = 'block';
            event.target.classList.add('active');
            loadUploads();
        } else if (section === 'all-files') {
            if (document.getElementById('all-files-section')) {
                document.getElementById('all-files-section').style.display = 'block';
                loadAllFiles();
            }
            event.target.classList.add('active');
        } else if (section === 'upload') {
            document.getElementById('upload-section').style.display = 'block';
            event.target.classList.add('active');
        } else if (section === 'camera') {
            document.getElementById('camera-section').style.display = 'block';
            event.target.classList.add('active');
            initializeCamera();
        }
    };

    // Camera functionality
    let cameraStream = null;
    let photoTimestamp = null;
    let photoBlob = null;

    function initializeCamera() {
        const startBtn = document.getElementById('start-camera-btn');
        const takeBtn = document.getElementById('take-photo-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const preview = document.getElementById('photo-preview');
        const uploadForm = document.getElementById('camera-upload-form');
        
        startBtn.addEventListener('click', startCamera);
        takeBtn.addEventListener('click', takePhoto);
        stopBtn.addEventListener('click', stopCamera);
        document.getElementById('retake-photo-btn').addEventListener('click', retakePhoto);
        uploadForm.addEventListener('submit', uploadCameraPhoto);
    }

    async function startCamera() {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Use back camera if available
            });
            
            const video = document.getElementById('camera-video');
            video.srcObject = cameraStream;
            
            document.getElementById('start-camera-btn').style.display = 'none';
            document.getElementById('take-photo-btn').style.display = 'inline-block';
            document.getElementById('stop-camera-btn').style.display = 'inline-block';
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    }

    function takePhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Capture current timestamp (cannot be edited)
        photoTimestamp = new Date();
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob
        canvas.toBlob(function(blob) {
            photoBlob = blob;
            
            // Show preview
            const preview = document.getElementById('photo-preview');
            const previewImg = document.getElementById('preview-image');
            const timestampDiv = document.getElementById('photo-timestamp');
            
            previewImg.src = URL.createObjectURL(blob);
            timestampDiv.textContent = `Photo taken at: ${photoTimestamp.toLocaleString()}`;
            preview.style.display = 'block';
            
            // Hide camera controls
            document.getElementById('take-photo-btn').style.display = 'none';
            
        }, 'image/jpeg', 0.8);
    }

    function retakePhoto() {
        document.getElementById('photo-preview').style.display = 'none';
        document.getElementById('take-photo-btn').style.display = 'inline-block';
        document.getElementById('camera-upload-form').reset();
        photoBlob = null;
        photoTimestamp = null;
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        
        document.getElementById('start-camera-btn').style.display = 'inline-block';
        document.getElementById('take-photo-btn').style.display = 'none';
        document.getElementById('stop-camera-btn').style.display = 'none';
        document.getElementById('photo-preview').style.display = 'none';
        
        const video = document.getElementById('camera-video');
        video.srcObject = null;
    }

    async function uploadCameraPhoto(e) {
        e.preventDefault();
        
        if (!photoBlob || !photoTimestamp) {
            alert('Please take a photo first.');
            return;
        }
        
        const uploadBtn = document.getElementById('upload-photo-btn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        
        try {
            // Create form data with photo
            const formData = new FormData();
            const filename = `photo_${Date.now()}.jpg`;
            formData.append('file', photoBlob, filename);
            
            // Upload file first
            const uploadResponse = await fetch('/upload-file-test', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.message || 'Photo upload failed');
            }
            
            // Save photo info to database with timestamp
            const photoData = {
                filename: filename,
                file_path: uploadResult.path,
                file_size: formatFileSize(photoBlob.size),
                mime_type: 'image/jpeg',
                upload_type: 'image',
                title: document.getElementById('photo_title').value,
                description: document.getElementById('photo_description').value,
                is_public: document.getElementById('photo_is_public').checked,
                user_id: await getCurrentUserId(),
                photo_taken_at: photoTimestamp.toISOString().slice(0, 19).replace('T', ' '),
                is_camera_photo: true
            };
            
            const result = await uploadCrud.create(photoData);
            
            if (result.success) {
                alert('Photo uploaded successfully with timestamp!');
                stopCamera();
                document.getElementById('camera-upload-form').reset();
                loadUploads();
            } else {
                alert('Error saving photo info: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading photo: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Photo';
        }
    }

    // Load All Files function
    async function loadAllFiles(applyFilters = false) {
        try {
            let uploads = await uploadCrud.readAll();
            
            // Apply search and type filters
            if (applyFilters) {
                const searchTerm = document.getElementById('search-all-files').value.toLowerCase();
                const typeFilter = document.getElementById('filter-all-type').value;
                
                if (searchTerm) {
                    uploads = uploads.filter(upload => 
                        (upload.title && upload.title.toLowerCase().includes(searchTerm)) ||
                        (upload.filename && upload.filename.toLowerCase().includes(searchTerm))
                    );
                }
                
                if (typeFilter !== 'all') {
                    uploads = uploads.filter(upload => upload.upload_type === typeFilter);
                }
            }
            
            if (uploads.length === 0) {
                document.getElementById('all-files-list').innerHTML = '<p class="no-uploads">No files found.</p>';
                return;
            }
            
            const uploadsHTML = uploads.map(upload => `
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
                            <span class="upload-user">User ID: ${upload.user_id}</span>
                            ${upload.is_camera_photo ? '<span class="camera-photo">📷 Camera Photo</span>' : ''}
                            ${upload.photo_taken_at ? `<span class="photo-timestamp">Taken: ${new Date(upload.photo_taken_at).toLocaleString()}</span>` : ''}
                        </div>
                        ${upload.description ? `<div class="upload-description">${upload.description}</div>` : ''}
                    </div>
                    <div class="upload-actions">
                        <button class="download-btn" onclick="downloadUpload(event, ${upload.id}, '${upload.filename}')">Download</button>
                        <button class="view-btn" onclick="viewUpload(${upload.id})">View Details</button>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('all-files-list').innerHTML = uploadsHTML;
        } catch (error) {
            console.error('Error loading all files:', error);
            document.getElementById('all-files-list').innerHTML = '<p class="no-uploads">Error loading files.</p>';
        }
    }

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