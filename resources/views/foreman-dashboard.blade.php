<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foreman Dashboard - CPMS</title>
    <link rel="stylesheet" href="{{ asset('styles/sidebar.css') }}">
</head>
<body>
    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="profile">
                <div class="profile-pic">
                    <img src="{{ asset('images/test.jpg') }}" alt="Profile">
                </div>
                <h3>FOREMAN DASHBOARD</h3>
            </div>

            <ul class="menu">
                <li><a href="#" onclick="showSection('tasks')" class="btn active">Staff Tasks</a></li>
                <li><a href="#" onclick="showSection('files')" class="btn">My Files</a></li>
                <li><a href="#" onclick="showSection('all-files')" class="btn">View All Files</a></li>
                <li><a href="#" onclick="showSection('upload')" class="btn">Upload File</a></li>
                <li><a href="#" onclick="showSection('camera')" class="btn">📷 Take Photo</a></li>
                <li><a href="#" onclick="logout()" class="btn">Logout</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">

            <!-- Worker Tasks Section -->
            <div class="section tasks-section" id="tasks-section">
                <div class="section-header">
                    <h3>Tasks from Staff</h3>
                    <button type="button" id="loadTasksBtn" class="action-btn">Refresh Tasks</button>
                </div>
                <div id="tasks-list" class="tasks-list"></div>
            </div>

            <!-- Uploads List Section -->
            <div class="section uploads-section" id="files-section" style="display: none;">
                <div class="section-header">
                    <h3>My Uploads</h3>
                    <button type="button" id="loadUploadsBtn" class="action-btn">Refresh Files</button>
                </div>
                <div class="file-filters" style="margin-bottom: 15px;">
                    <input type="text" id="search-files" placeholder="Search files by name..." style="padding: 8px; margin-right: 10px; width: 200px;">
                    <select id="filter-type" style="padding: 8px; margin-right: 10px;">
                        <option value="all">All Types</option>
                        <option value="task">Task Related</option>
                        <option value="image">Images</option>
                        <option value="report">Reports</option>
                        <option value="document">Documents</option>
                        <option value="blueprint">Blueprints</option>
                        <option value="safety">Safety</option>
                        <option value="inspection">Inspection</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="button" id="apply-filters" class="action-btn">Apply Filters</button>
                </div>
                <div id="uploads-list" class="uploads-list"></div>
            </div>

            <!-- All Files Section -->
            <div class="section uploads-section" id="all-files-section" style="display: none;">
                <div class="section-header">
                    <h3>All Files (All Users)</h3>
                    <button type="button" id="loadAllFilesBtn" class="action-btn">Refresh All Files</button>
                </div>
                <div class="file-filters" style="margin-bottom: 15px;">
                    <input type="text" id="search-all-files" placeholder="Search files by name..." style="padding: 8px; margin-right: 10px; width: 200px;">
                    <select id="filter-all-type" style="padding: 8px; margin-right: 10px;">
                        <option value="all">All Types</option>
                        <option value="task">Task Related</option>
                        <option value="image">Images</option>
                        <option value="report">Reports</option>
                        <option value="document">Documents</option>
                        <option value="blueprint">Blueprints</option>
                        <option value="safety">Safety</option>
                        <option value="inspection">Inspection</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="button" id="apply-all-filters" class="action-btn">Apply Filters</button>
                </div>
                <div id="all-files-list" class="uploads-list"></div>
            </div>

            <!-- Upload Form Section -->
            <div class="section form-section" id="upload-section" style="display: none;">
                <div class="section-header">
                    <h3>Upload New File</h3>
                </div>
                <form id="uploadForm" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="form-fields">
                        <div class="form-row">
                            <div class="input-group">
                                <label for="file">Select File:</label>
                                <input type="file" id="file" name="file" required accept="*/*">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="title">File Title:</label>
                                <input id="title" name="title" type="text" required placeholder="Enter a descriptive title">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="upload_type">File Type:</label>
                                <select id="upload_type" name="upload_type" class="form-select" required>
                                    <option value="task">Task Related</option>
                                    <option value="report">Report</option>
                                    <option value="document">Document</option>
                                    <option value="blueprint">Blueprint/Plan</option>
                                    <option value="safety">Safety Document</option>
                                    <option value="inspection">Inspection Report</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="description">Description:</label>
                                <textarea id="description" name="description" class="form-textarea" placeholder="Describe what this file is about"></textarea>
                            </div>
                        </div>

                        <div class="form-row checkbox-group">
                            <div class="input-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="is_public" name="is_public" value="1">
                                    <span class="checkmark"></span>
                                    Make file public
                                </label>
                                <small class="checkbox-hint">Public files can be seen by other users</small>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="form-actions">
                        <button type="submit" id="uploadBtn" class="btn-primary">Upload File</button>
                        <button type="button" id="clearFormBtn" class="btn-clear">Clear Form</button>
                    </div>
                </form>
            </div>

            <!-- Camera Section -->
            <div class="section form-section" id="camera-section" style="display: none;">
                <div class="section-header">
                    <h3>📷 Take Photo with Timestamp</h3>
                </div>
                <div class="camera-container">
                    <video id="camera-video" autoplay playsinline style="width: 100%; max-width: 400px; border-radius: 8px;"></video>
                    <canvas id="camera-canvas" style="display: none;"></canvas>
                    
                    <div class="camera-controls" style="margin-top: 15px;">
                        <button type="button" id="start-camera-btn" class="btn-primary">Start Camera</button>
                        <button type="button" id="take-photo-btn" class="btn-primary" style="display: none;">Take Photo</button>
                        <button type="button" id="stop-camera-btn" class="btn-clear" style="display: none;">Stop Camera</button>
                    </div>
                    
                    <div id="photo-preview" style="margin-top: 15px; display: none;">
                        <h4>Photo Preview:</h4>
                        <img id="preview-image" style="width: 100%; max-width: 400px; border-radius: 8px; border: 2px solid #007bff;">
                        <div id="photo-timestamp" style="margin: 10px 0; font-weight: bold; color: #007bff;"></div>
                        
                        <form id="camera-upload-form">
                            @csrf
                            <div class="form-fields">
                                <div class="form-row">
                                    <div class="input-group">
                                        <label for="photo_title">Photo Title:</label>
                                        <input id="photo_title" name="title" type="text" required placeholder="Enter photo description">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="input-group">
                                        <label for="photo_description">Description:</label>
                                        <textarea id="photo_description" name="description" class="form-textarea" placeholder="Additional details about this photo"></textarea>
                                    </div>
                                </div>
                                
                                <div class="form-row checkbox-group">
                                    <div class="input-group">
                                        <label class="checkbox-label">
                                            <input type="checkbox" id="photo_is_public" name="is_public" value="1">
                                            <span class="checkmark"></span>
                                            Make photo public
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" id="upload-photo-btn" class="btn-primary">Upload Photo</button>
                                <button type="button" id="retake-photo-btn" class="btn-clear">Retake Photo</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/foreman.js') }}"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    });
    
    function showSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
    </script>
</body>
</html>