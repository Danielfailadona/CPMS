document.addEventListener('DOMContentLoaded', function() {
    // Initialize CRUD helpers
    const complaintCrud = new CrudHelper('complaints');
    const uploadCrud = new CrudHelper('uploads');

    // Get form elements
    const complaintForm = document.getElementById('complaintForm');
    const submitComplaintBtn = document.getElementById('submitComplaintBtn');
    const clearComplaintFormBtn = document.getElementById('clearComplaintFormBtn');
    const loadComplaintsBtn = document.getElementById('loadComplaintsBtn');
    const loadUploadsBtn = document.getElementById('loadUploadsBtn');
    
    // Get list containers
    const complaintsList = document.getElementById('complaints-list');
    const uploadsList = document.getElementById('uploads-list');

    // Load data
    loadComplaintsBtn.addEventListener('click', loadComplaints);
    loadUploadsBtn.addEventListener('click', loadUploads);
    clearComplaintFormBtn.addEventListener('click', resetComplaintForm);
    
    // Filter functionality
    document.getElementById('apply-filters').addEventListener('click', () => loadUploads(true));
    document.getElementById('search-files').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') loadUploads(true);
    });

    // Handle complaint submission
    complaintForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        submitComplaintBtn.disabled = true;
        submitComplaintBtn.textContent = 'Submitting...';

        try {
            const complaintData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                client_id: getCurrentUserId()
            };

            const result = await complaintCrud.create(complaintData);

            if (result.success) {
                alert('Complaint submitted successfully!');
                resetComplaintForm();
                loadComplaints();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting complaint: ' + error.message);
        } finally {
            submitComplaintBtn.disabled = false;
            submitComplaintBtn.textContent = 'Submit Complaint';
        }
    });



    async function loadComplaints() {
        try {
            const complaints = await complaintCrud.readAll();
            const currentUserId = getCurrentUserId();
            
            const userComplaints = complaints.filter(complaint => complaint.client_id == currentUserId);
            
            if (userComplaints.length === 0) {
                complaintsList.innerHTML = '<p class="no-complaints">No complaints submitted yet.</p>';
                return;
            }
            
            const complaintsHTML = userComplaints.map(complaint => `
                <div class="complaint-item" data-id="${complaint.id}">
                    <div class="complaint-info">
                        <div class="complaint-title">${complaint.title}</div>
                        <div class="complaint-details">
                            <span class="complaint-priority priority-${complaint.priority}">${complaint.priority.toUpperCase()}</span>
                            <span class="complaint-status status-${complaint.status}">${complaint.status.replace('_', ' ').toUpperCase()}</span>
                            <span class="complaint-date">${new Date(complaint.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="complaint-description">${complaint.description}</div>
                        ${complaint.worker_notes ? `<div class="staff-notes"><strong>Staff Notes:</strong> ${complaint.worker_notes}</div>` : ''}
                    </div>
                    <div class="complaint-actions">
                        ${complaint.status === 'resolved' ? `<button class="delete-btn" onclick="deleteComplaint(${complaint.id})">Delete (Satisfied)</button>` : ''}
                    </div>
                </div>
            `).join('');
            
            complaintsList.innerHTML = complaintsHTML;
        } catch (error) {
            console.error('Error loading complaints:', error);
            complaintsList.innerHTML = '<p class="no-complaints">Error loading complaints.</p>';
        }
    }

    async function loadUploads(applyFilters = false) {
        try {
            let uploads = await uploadCrud.readAll();
            
            // Apply search and type filters
            if (applyFilters) {
                const searchTerm = document.getElementById('search-files').value.toLowerCase();
                const typeFilter = document.getElementById('filter-type').value;
                
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
                uploadsList.innerHTML = '<p class="no-uploads">No files available.</p>';
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
                        </div>
                        ${upload.description ? `<div class="upload-description">${upload.description}</div>` : ''}
                    </div>
                    <div class="upload-actions">
                        <button class="download-btn" onclick="downloadUpload(event, ${upload.id}, '${upload.filename}')">Download</button>
                        <button class="view-btn" onclick="viewUpload(${upload.id})">View</button>
                    </div>
                </div>
            `).join('');
            
            uploadsList.innerHTML = uploadsHTML;
        } catch (error) {
            console.error('Error loading uploads:', error);
            uploadsList.innerHTML = '<p class="no-uploads">Error loading files.</p>';
        }
    }

    // Delete complaint (when client is satisfied)
    window.deleteComplaint = async function(id) {
        if (confirm('Are you sure you want to delete this complaint? This means you are satisfied with the resolution.')) {
            const result = await complaintCrud.delete(id);
            
            if (result.success) {
                alert('Complaint deleted successfully!');
                loadComplaints();
            } else {
                alert('Error: ' + (result.message || 'Unknown error'));
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



    function resetComplaintForm() {
        complaintForm.reset();
        document.getElementById('complaint_priority').value = 'medium';
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
            'document': 'Document',
            'image': 'Image',
            'contract': 'Contract',
            'invoice': 'Invoice',
            'blueprint': 'Blueprint',
            'other': 'Other'
        };
        return types[type] || type;
    }

    // Navigation function
    window.showSection = function(section) {
        // Hide all sections
        document.getElementById('complaints-section').style.display = 'none';
        document.getElementById('submit-complaint-section').style.display = 'none';
        document.getElementById('files-section').style.display = 'none';
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        
        // Show selected section and activate button
        if (section === 'complaints') {
            document.getElementById('complaints-section').style.display = 'block';
            event.target.classList.add('active');
            loadComplaints();
        } else if (section === 'submit-complaint') {
            document.getElementById('submit-complaint-section').style.display = 'block';
            event.target.classList.add('active');
        } else if (section === 'files') {
            document.getElementById('files-section').style.display = 'block';
            event.target.classList.add('active');
            loadUploads();
        }
    };

    // Load data on page load
    loadComplaints();
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