<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Dashboard - File Management</title>
    <link rel="stylesheet" href="{{ asset('styles/foreman.css') }}">
    <link rel="stylesheet" href="{{ asset('styles/nav.css') }}">
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="header-left">
                <div class="title">
                    <h1>CLIENT DASHBOARD - FILE MANAGEMENT</h1>
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
                    <button class="nav-btn active" onclick="showSection('complaints')">My Complaints</button>
                    <button class="nav-btn" onclick="showSection('submit-complaint')">Submit Complaint</button>
                    <button class="nav-btn" onclick="showSection('files')">Available Files</button>
                </div>
            </div>

            <!-- Complaints Section -->
            <div class="section complaints-section" id="complaints-section">
                <div class="section-header">
                    <h3>My Complaints</h3>
                    <button type="button" id="loadComplaintsBtn" class="action-btn">Refresh Complaints</button>
                </div>
                <div id="complaints-list" class="complaints-list"></div>
            </div>

            <!-- New Complaint Form -->
            <div class="section form-section" id="submit-complaint-section" style="display: none;">
                <div class="section-header">
                    <h3>Submit New Complaint</h3>
                </div>
                <form id="complaintForm">
                    @csrf
                    <div class="form-fields">
                        <div class="form-row">
                            <div class="input-group">
                                <label for="complaint_title">Complaint Title:</label>
                                <input id="complaint_title" name="title" type="text" required placeholder="Brief description of the issue">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="complaint_priority">Priority:</label>
                                <select id="complaint_priority" name="priority" class="form-select" required>
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="complaint_description">Description:</label>
                                <textarea id="complaint_description" name="description" class="form-textarea" required placeholder="Detailed description of the complaint"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" id="submitComplaintBtn" class="btn-primary">Submit Complaint</button>
                        <button type="button" id="clearComplaintFormBtn" class="btn-clear">Clear Form</button>
                    </div>
                </form>
            </div>

            <!-- Available Files Section -->
            <div class="section uploads-section" id="files-section" style="display: none;">
                <div class="section-header">
                    <h3>Available Files</h3>
                    <button type="button" id="loadUploadsBtn" class="action-btn">Refresh Files</button>
                </div>
                <div id="uploads-list" class="uploads-list"></div>
            </div>
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/client.js') }}"></script>
</body>
</html>
