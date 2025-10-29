<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Dashboard - CPMS</title>
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
                <h3>CLIENT DASHBOARD</h3>
            </div>

            <ul class="menu">
                <li><a href="#" onclick="showSection('complaints')" class="btn active">My Complaints</a></li>
                <li><a href="#" onclick="showSection('submit-complaint')" class="btn">Submit Complaint</a></li>
                <li><a href="#" onclick="showSection('files')" class="btn">Available Files</a></li>
                <li><a href="#" onclick="logout()" class="btn">Logout</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">

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
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/client.js') }}"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
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
