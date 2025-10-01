// ====================================
// Authentication Management System
// Sleepy Tiger Farmhouse
// ====================================

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    try {
      await this.checkAuthStatus();
      console.log('Auth status checked, current user:', this.currentUser);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
    this.bindEvents();
    this.updateNavigation();
    
    // Initialize phone hint on register page
    if (document.getElementById('register-form')) {
      // Wait a bit for translations to load
      setTimeout(() => {
        this.updatePhoneHint();
      }, 100);
    }
  }

  async checkAuthStatus() {
    try {
      console.log('Checking authentication status...');
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      console.log('Auth check response:', data);
      
      if (data.authenticated) {
        this.currentUser = data.user;
        window.currentUser = this.currentUser;
        console.log('User authenticated:', this.currentUser);
      } else {
        console.log('User not authenticated');
        this.currentUser = null;
        window.currentUser = null;
      }
      
      // Dispatch event to notify that auth status check is complete
      document.dispatchEvent(new CustomEvent('authStatusChecked'));
    } catch (error) {
      console.error('Auth check failed:', error);
      this.currentUser = null;
      window.currentUser = null;
      // Dispatch event even if check fails
      document.dispatchEvent(new CustomEvent('authStatusChecked'));
    }
  }

  // Validate phone number based on country
  validatePhoneNumber(phone, country) {
    // Remove spaces and dashes but keep +
    const cleaned = phone.replace(/[\s\-]/g, '');
    
    switch (country) {
      case 'AU': // Australia: 10 digits, starts with 04 or 05 (mobile) or +61 4/5
        return /^0[45]\d{8}$/.test(cleaned) || /^\+61[45]\d{8}$/.test(cleaned);
      case 'CN': // China: 11 digits, starts with 1 and second digit 3-9
        return /^1[3-9]\d{9}$/.test(cleaned) || /^\+861[3-9]\d{9}$/.test(cleaned);
      case 'RU': // Russia: 10 digits, starts with 9 (mobile) or +7 9
        return /^[9]\d{9}$/.test(cleaned) || /^\+79\d{9}$/.test(cleaned);
      default:
        // For other countries, basic validation
        const digitsOnly = cleaned.replace(/\D/g, '');
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }
  }

  // Format phone number with country code prefix
  formatPhoneNumberWithCountryCode(phone, country) {
    // Remove spaces and dashes but keep +
    let cleaned = phone.replace(/[\s\-]/g, '');
    
    switch (country) {
      case 'AU': // Australia
        // Handle different input formats
        if (cleaned.startsWith('+61')) {
          return cleaned;
        } else if (cleaned.startsWith('61')) {
          return '+' + cleaned;
        } else if (cleaned.startsWith('0')) {
          return '+61' + cleaned.substring(1);
        } else {
          return '+61' + cleaned;
        }
      case 'CN': // China
        if (cleaned.startsWith('+86')) {
          return cleaned;
        } else if (cleaned.startsWith('86')) {
          return '+' + cleaned;
        } else {
          return '+86' + cleaned;
        }
      case 'RU': // Russia
        if (cleaned.startsWith('+7')) {
          return cleaned;
        } else if (cleaned.startsWith('7')) {
          return '+' + cleaned;
        } else {
          return '+7' + cleaned;
        }
      default:
        // For other countries, just ensure it has a +
        return phone.startsWith('+') ? phone : '+' + phone;
    }
  }

  // Update phone format hint based on selected country
  updatePhoneHint() {
    const countrySelect = document.getElementById('country');
    const hintElement = document.getElementById('phone-format-hint');
    
    if (!countrySelect || !hintElement) return;
    
    const country = countrySelect.value;
    let hintText = '';
    
    switch (country) {
      case 'AU':
        hintText = window.t('phone_hint_au') || 'Australian phone number (10 digits, e.g., 0400123456)';
        break;
      case 'CN':
        hintText = window.t('phone_hint_cn') || 'Chinese phone number (11 digits, e.g., 13812345678)';
        break;
      case 'RU':
        hintText = window.t('phone_hint_ru') || 'Russian phone number (10 digits, e.g., 9123456789)';
        break;
      default:
        hintText = '';
    }
    
    hintElement.textContent = hintText;
    hintElement.style.display = hintText ? 'block' : 'none';
  }

  bindEvents() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
      
      // Add event listener for country selection
      const countrySelect = document.getElementById('country');
      if (countrySelect) {
        countrySelect.addEventListener('change', () => this.updatePhoneHint());
      }
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
    }

    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('login-message');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.currentUser = data.user;
        window.currentUser = this.currentUser;
        
        // Update language preference if it exists
        if (this.currentUser.preferred_language && window.languageManager) {
          window.languageManager.setLanguage(this.currentUser.preferred_language);
        }
        
        this.showMessage(messageDiv, window.t('success_message') || 'Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
          if (this.currentUser.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'profile.html';
          }
        }, 1000);
      } else {
        this.showMessage(messageDiv, data.error || (window.t('error_message') || 'Login failed'), 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage(messageDiv, window.t('error_message') || 'Login request failed', 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    // Get form elements
    const countrySelect = document.getElementById('country');
    const phoneInput = document.getElementById('phone');
    const messageDiv = document.getElementById('register-message');
    
    // Validate phone number based on selected country
    if (countrySelect.value && phoneInput.value) {
      if (!this.validatePhoneNumber(phoneInput.value, countrySelect.value)) {
        this.showMessage(messageDiv, window.t('phone_format_error') || 'Please enter a valid phone number for the selected country', 'error');
        return;
      }
    }
    
    // Format phone number with country code prefix
    let formattedPhone = phoneInput.value;
    if (countrySelect.value && phoneInput.value) {
      formattedPhone = this.formatPhoneNumberWithCountryCode(phoneInput.value, countrySelect.value);
    }
    
    const formData = {
      username: document.getElementById('username').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      first_name: document.getElementById('first_name').value,
      last_name: document.getElementById('last_name').value,
      phone: formattedPhone,
      preferred_language: document.getElementById('preferred_language')?.value || 'en'
    };
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        this.showMessage(messageDiv, 'Registration successful! Please login.', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        this.showMessage(messageDiv, data.error || (window.t('error_message') || 'Registration failed'), 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage(messageDiv, window.t('error_message') || 'Registration request failed', 'error');
    }
  }

  async handleLogout(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
        this.currentUser = null;
        window.currentUser = null;
        window.location.href = 'index.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = 'index.html'; // Force redirect even if API fails
    }
  }

  async handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = {
      first_name: document.getElementById('profile_first_name').value,
      last_name: document.getElementById('profile_last_name').value,
      phone: document.getElementById('profile_phone').value
    };
    
    const messageDiv = document.getElementById('profile-message');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        // Update current user data
        if (this.currentUser) {
          this.currentUser.first_name = formData.first_name;
          this.currentUser.last_name = formData.last_name;
          window.currentUser = this.currentUser;
        }
        
        this.showMessage(messageDiv, window.t('success_message') || 'Profile updated successfully!', 'success');
      } else {
        this.showMessage(messageDiv, data.error || (window.t('error_message') || 'Update failed'), 'error');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      this.showMessage(messageDiv, window.t('error_message') || 'Update request failed', 'error');
    }
  }

  updateNavigation() {
    const userInfo = document.getElementById('user-info');
    const logoutBtn = document.getElementById('logout-btn');
    const authLinks = document.querySelector('.auth-links');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const profileBtn = document.getElementById('profile-btn');
    
    if (this.currentUser) {
      // Hide login/register links
      if (authLinks) {
        authLinks.style.display = 'none';
      }
      
      // Show profile button
      if (profileBtn) {
        profileBtn.style.display = 'inline-flex';
      }
      
      // Show user info and logout
      if (userInfo) {
        userInfo.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
        userInfo.style.display = 'inline';
      }
      
      if (logoutBtn) {
        logoutBtn.style.display = 'inline';
      }
      
      // Show admin link if admin
      if (this.currentUser.role === 'admin') {
        this.addAdminLink();
      }
    } else {
      // Show login/register links
      if (authLinks) {
        authLinks.style.display = 'flex';
      }
      
      // Hide profile button
      if (profileBtn) {
        profileBtn.style.display = 'none';
      }
      
      if (userInfo) {
        userInfo.style.display = 'none';
      }
      
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
      }
    }
  }

  addAdminLink() {
    const navRight = document.querySelector('.nav-right');
    if (navRight && !document.getElementById('admin-link')) {
      const adminLink = document.createElement('a');
      adminLink.href = 'admin.html';
      adminLink.id = 'admin-link';
      adminLink.setAttribute('data-translate', 'nav_admin');
      adminLink.textContent = window.t('nav_admin') || 'Admin';
      adminLink.className = 'admin-nav-link';
      
      // Insert before user info in nav-right
      const userInfo = document.getElementById('user-info');
      if (userInfo && userInfo.parentNode === navRight) {
        navRight.insertBefore(adminLink, userInfo);
      } else {
        // If user-info not found or not in nav-right, append to nav-right
        navRight.appendChild(adminLink);
      }
    }
  }

  showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }

  // Redirect if not authenticated
  requireAuth() {
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  // Redirect if not admin
  requireAdmin() {
    console.log('Checking admin privileges, current user:', this.currentUser);
    if (!this.currentUser) {
      console.log('No user logged in, redirecting to login page');
      window.location.href = 'login.html';
      return false;
    }
    
    if (this.currentUser.role !== 'admin') {
      console.log('User is not admin, redirecting to login page');
      window.location.href = 'login.html';
      return false;
    }
    
    console.log('User is admin, access granted');
    return true;
  }
}

// ====================================
// Initialize Auth Manager
// ====================================
let authManager;

document.addEventListener('DOMContentLoaded', async () => {
  authManager = new AuthManager();
  
  // Make globally accessible
  window.authManager = authManager;
  
  // Check if current page requires authentication
  const currentPage = window.location.pathname.split('/').pop();
  
  // Wait for auth check to complete before any page-specific checks
  await authManager.checkAuthStatus();
  
  if (currentPage === 'profile.html') {
    if (!authManager.requireAuth()) return;
  } else if (currentPage === 'admin.html') {
    if (!authManager.requireAdmin()) return;
  }
  
  // Update navigation after auth check
  authManager.updateNavigation();
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager };
}