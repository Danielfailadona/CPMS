<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foreman Dashboard - File Management</title>
    <link rel="stylesheet" href="{{ asset('styles/foreman.css') }}">
    <link rel="stylesheet" href="{{ asset('styles/nav.css') }}">
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="header-left">
                <div class="title">
                    <h1>FOREMAN DASHBOARD - FILE MANAGEMENT</h1>
                </div>
            </div>
            
            <div class="header-right">
                <div class="user-menu">
                    <button onclick="logout()" class="logout-btn">Logout</button>
                </div>
                <div class="logo-con">
                    <img src="{{ asset('images/test.jpg') }}" alt="logo">
                    <h3>CPMS</h3>
                </div>
            </div>
        </div>

        <div class="dashboard-content">
            <!-- Navigation Buttons -->
            <div class="section nav-section">
                <div class="nav-buttons">
                    <button class="nav-btn active" onclick="showSection('tasks')">Worker Tasks</button>
                    <button class="nav-btn" onclick="showSection('files')">My Files</button>
                    <button class="nav-btn" onclick="showSection('upload')">Upload File</button>
                </div>
            </div>

            <!-- Worker Tasks Section -->
            <div class="section tasks-section" id="tasks-section">
                <div class="section-header">
                    <h3>Tasks from Workers</h3>
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
                <div id="uploads-list" class="uploads-list"></div>
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
                                    <option value="image">Image/Photo</option>
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
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/foreman.js') }}"></script>
</body>
</html>