<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - User Management</title>
    <link rel="stylesheet" href="{{ asset('styles/admin.css') }}">
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="header-left">
                <div class="title">
                    <h1>ADMIN DASHBOARD - USER MANAGEMENT</h1>
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
            <!-- Users List Section -->
            <div class="section users-section">
                <div class="section-header">
                    <h3>System Users</h3>
                    <button type="button" id="loadUsersBtn" class="action-btn">Refresh Users</button>
                </div>
                <div id="users-list" class="users-list"></div>
            </div>

            <!-- User Form Section -->
            <div class="section form-section">
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
                                    <option value="worker">Worker</option>
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
        </div>
    </div>
    
    <script src="{{ asset('js/crudHelper.js') }}"></script>
    <script src="{{ asset('js/admin.js') }}"></script>
</body>
</html>