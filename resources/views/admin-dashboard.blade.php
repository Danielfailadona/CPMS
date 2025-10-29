<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - CPMS</title>
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
                <h3>ADMIN DASHBOARD</h3>
            </div>

            <ul class="menu">
                <li><a href="#" onclick="showSection('users')" class="btn active">Users</a></li>
                <li><a href="#" onclick="showSection('uploads')" class="btn">Files</a></li>
                <li><a href="#" onclick="showSection('tasks')" class="btn">Tasks</a></li>
                <li><a href="#" onclick="showSection('complaints')" class="btn">Complaints</a></li>
                <li><a href="#" onclick="logout()" class="btn">Logout</a></li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main-content">

            <!-- Users Section -->
            <div class="section users-section" id="users-section">
                <div class="section-header">
                    <h3>System Users</h3>
                    <button type="button" id="loadUsersBtn" class="action-btn">Refresh Users</button>
                </div>
                <div id="users-list" class="users-list"></div>
            </div>

            <!-- User Form Section -->
            <div class="section form-section" id="user-form-section" style="display: none;">
                <div class="section-header">
                    <h3>Create/Edit User</h3>
                </div>
                <form id="userForm">
                    @csrf
                    <input type="hidden" id="user_id" name="user_id">
                    
                    <div class="form-fields">
                        <div class="form-row">
                            <div class="input-group">
                                <label for="name">Full Name:</label>
                                <input id="name" name="name" type="text" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="email">Email Address:</label>
                                <input id="email" name="email" type="email" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="user_type">User Type:</label>
                                <select id="user_type" name="user_type" class="form-select" required>
                                    <option value="client">Client</option>
                                    <option value="staff">Staff</option>
                                    <option value="foreman">Foreman</option>
                                    <option value="manager">Manager</option>
                                    <option value="ceo">CEO</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="password">Password:</label>
                                <input id="password" name="password" type="password">
                                <small class="password-hint">Leave blank to keep current password when editing</small>
                            </div>
                        </div>

                        <div class="form-row checkbox-group">
                            <div class="input-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="is_authorized" name="is_authorized" value="1">
                                    <span class="checkmark"></span>
                                    Authorized to Login
                                </label>
                            </div>
                        </div>

                        <div class="form-row checkbox-group">
                            <div class="input-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="is_active" name="is_active" value="1" checked>
                                    <span class="checkmark"></span>
                                    Account Active
                                </label>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="input-group">
                                <label for="authorization_notes">Authorization Notes:</label>
                                <textarea id="authorization_notes" name="authorization_notes" class="form-textarea" placeholder="Notes about user authorization status"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="form-actions">
                        <button type="submit" id="createBtn" class="btn-primary">Create User</button>
                        <button type="button" id="updateBtn" class="btn-secondary" style="display:none;">Update User</button>
                        <button type="button" id="clearBtn" class="btn-clear">Clear Form</button>
                    </div>
                </form>
            </div>

            <!-- Files Section -->
            <div class="section uploads-section" id="uploads-section" style="display: none;">
                <div class="section-header">
                    <h3>All Files</h3>
                    <button type="button" id="loadUploadsBtn" class="action-btn">Refresh Files</button>
                </div>
                <div id="uploads-list" class="uploads-list"></div>
            </div>

            <!-- Tasks Section -->
            <div class="section tasks-section" id="tasks-section" style="display: none;">
                <div class="section-header">
                    <h3>All Tasks</h3>
                    <button type="button" id="loadTasksBtn" class="action-btn">Refresh Tasks</button>
                </div>
                <div id="tasks-list" class="tasks-list"></div>
            </div>

            <!-- Complaints Section -->
            <div class="section complaints-section" id="complaints-section" style="display: none;">
                <div class="section-header">
                    <h3>All Complaints</h3>
                    <button type="button" id="loadComplaintsBtn" class="action-btn">Refresh Complaints</button>
                </div>
                <div id="complaints-list" class="complaints-list"></div>
            </div>
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/admin.js') }}"></script>
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