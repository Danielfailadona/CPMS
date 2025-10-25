<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login & Register</title>
    <link rel="stylesheet" href="{{ asset('styles/login.css') }}">
</head>
<body>
    <div class="main">
        <div class="header">
            <div class="con-in-header1">
                <div class="title">
                    <h1>LOGIN & REGISTER</h1>
                </div>
            </div>
            
            <div class="con-in-header2">
                <div class="logo-con">
                    <img src="{{ asset('images/test.jpg') }}" alt="logo">
                    <h3>CPMS</h3>
                </div>
            </div>
        </div>

        <div class="login-container">
            <div class="tabs">
                <button class="tab active" onclick="showTab('login')">LOGIN</button>
                <button class="tab" onclick="showTab('register')">REGISTER</button>
            </div>

            <div id="message" class="message"></div>

            <!-- Login Form -->
            <form id="loginForm" class="form-container active">
                @csrf
                <div class="form-group">
                    <label for="loginEmail">Email:</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password:</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <button type="submit" class="submit-btn">LOGIN</button>
            </form>

            <!-- Register Form -->
            <form id="registerForm" class="form-container">
                @csrf
                <div class="form-group">
                    <label for="registerName">Name:</label>
                    <input type="text" id="registerName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email:</label>
                    <input type="email" id="registerEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="registerUserType">User Type:</label>
                    <select id="registerUserType" name="user_type" class="form-input" required>
                        <option value="client">Client</option>
                        <option value="worker">Worker</option>
                        <option value="foreman">Foreman</option>
                        <option value="manager">Manager</option>
                        <option value="ceo">CEO</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password:</label>
                    <input type="password" id="registerPassword" name="password" required>
                </div>
                <div class="form-group">
                    <label for="registerPasswordConfirmation">Confirm Password:</label>
                    <input type="password" id="registerPasswordConfirmation" name="password_confirmation" required>
                </div>
                <button type="submit" class="submit-btn">REGISTER</button>
            </form>

            <div class="auth-status" id="authStatus">
                Checking authentication...
            </div>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all forms
            document.querySelectorAll('.form-container').forEach(form => {
                form.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected form and activate tab
            document.getElementById(tabName + 'Form').classList.add('active');
            event.target.classList.add('active');
        }

        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        // Login form handler
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message, 'success');
                    setTimeout(() => {
                        // Redirect based on user type
                        const redirectUrl = getDashboardUrl(result.user_type);
                        window.location.href = redirectUrl;
                    }, 1000);
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            }
        });

        // Register form handler
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage(result.message, 'success');
                    // Show pending authorization message for registered users
                    showMessage('Registration successful! Your account is pending authorization. You will be notified once approved.', 'success');
                    // Reset form after successful registration
                    document.getElementById('registerForm').reset();
                    // Switch back to login tab
                    showTab('login');
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
            }
        });

        // Determine dashboard URL based on user type
        function getDashboardUrl(userType) {
            const dashboardRoutes = {
                'admin': '/admin-dashboard',
                'client': '/client-dashboard', 
                'foreman': '/foreman-dashboard',
                'ceo': '/ceo-dashboard',
                'manager': '/manager-dashboard',
                'worker': '/worker-dashboard'
            };
            
            return dashboardRoutes[userType] || '/construction-report';
        }

        // Check authentication status on page load
        async function checkAuth() {
            try {
                const response = await fetch('/check-auth');
                const result = await response.json();
                
                const authStatus = document.getElementById('authStatus');
                
                if (result.authenticated) {
                    const dashboardUrl = getDashboardUrl(result.user.user_type);
                    authStatus.innerHTML = `Welcome, ${result.user.name}! <a href="${dashboardUrl}">Go to Dashboard</a> | <a href="#" onclick="logout()">Logout</a>`;
                } else {
                    authStatus.innerHTML = 'You are not logged in.';
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        }

        // Logout function
        async function logout() {
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
                    showMessage(result.message, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } catch (error) {
                showMessage('Logout failed.', 'error');
            }
        }

        // Check auth on page load
        checkAuth();
    </script>
</body>
</html>