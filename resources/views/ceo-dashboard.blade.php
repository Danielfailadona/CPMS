<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CEO Dashboard - File Management</title>
    <link rel="stylesheet" href="{{ asset('styles/foreman.css') }}">
    <link rel="stylesheet" href="{{ asset('styles/nav.css') }}">
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="header-left">
                <div class="title">
                    <h1>CEO DASHBOARD - FILE MANAGEMENT</h1>
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
                    <button class="nav-btn active" onclick="showSection('files')">My Files</button>
                    <button class="nav-btn" onclick="showSection('upload')">Upload File</button>
                    <button class="nav-btn" onclick="showSection('camera')">📷 Take Photo</button>
                </div>
            </div>

            <!-- Uploads List Section -->
            <div class="section uploads-section" id="files-section">
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
                                    <option value="report">Executive Report</option>
                                    <option value="document">Document</option>
                                    <option value="contract">Contract</option>
                                    <option value="invoice">Invoice</option>
                                    <option value="blueprint">Blueprint/Plan</option>
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
</body>
</html>
