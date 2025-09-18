// ====================================
// Users Management Module
// Sleepy Tiger Farmhouse
// ====================================

class UsersManager {
  constructor(adminManager) {
    this.adminManager = adminManager;
  }

  async loadUsers() {
    try {
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const users = await response.json();
        this.displayUsers(users);
      } else {
        this.adminManager.showError('users-table', 'Failed to load users');
      }
    } catch (error) {
      console.error('Load users error:', error);
      this.adminManager.showError('users-table', 'Error loading users');
    }
  }

  displayUsers(users) {
    const tbody = document.querySelector('#users-table tbody');
    
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" data-translate="no_users_found">No users found</td></tr>`;
      // Translate the new content
      if (window.languageManager) {
        window.languageManager.translatePage();
      }
      return;
    }

    tbody.innerHTML = users.map(user => {
      // Get role and status translation keys
      const roleKey = `role_${user.role}`;
      const roleText = user.role === 'admin' ? 'Admin' : 'User';
      const statusKey = user.is_active ? 'status_active' : 'status_inactive';
      const statusText = user.is_active ? 'Active' : 'Inactive';
      
      return `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.first_name} ${user.last_name}</td>
          <td>
            <span class="role-badge role-${user.role}" data-translate="${roleKey}">${roleText}</span>
          </td>
          <td>
            <span class="status-badge ${user.is_active ? 'active' : 'inactive'}" data-translate="${statusKey}">${statusText}</span>
          </td>
          <td class="actions">
            <button onclick="window.adminManager.usersManager.editUser(${user.id})" class="btn-edit" data-translate="edit">Edit</button>
            ${user.is_active ? 
              `<button onclick="window.adminManager.usersManager.deactivateUser(${user.id})" class="btn-delete" data-translate="deactivate">Deactivate</button>` :
              `<button onclick="window.adminManager.usersManager.activateUser(${user.id})" class="btn-activate" data-translate="activate">Activate</button>`
            }
          </td>
        </tr>
      `;
    }).join('');
    
    // Translate the new content
    if (window.languageManager) {
      window.languageManager.translatePage();
    }
  }

  openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    
    form.reset();
    document.getElementById('user-id').value = userId || '';
    
    if (userId) {
      title.textContent = 'Edit User';
      this.loadUserData(userId);
    } else {
      title.textContent = 'Create User';
      document.getElementById('user-password').required = true;
    }
    
    modal.style.display = 'block';
  }

  async loadUserData(userId) {
    try {
      // Get user data from the table for now (could also fetch from API)
      const users = await fetch('/api/admin/users').then(r => r.json());
      const user = users.find(u => u.id === userId);
      
      if (user) {
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-first-name').value = user.first_name;
        document.getElementById('user-last-name').value = user.last_name;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-language').value = user.preferred_language;
        document.getElementById('user-password').required = false;
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  }

  async handleUserSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value;
    const formData = {
      username: document.getElementById('user-username').value,
      email: document.getElementById('user-email').value,
      first_name: document.getElementById('user-first-name').value,
      last_name: document.getElementById('user-last-name').value,
      phone: document.getElementById('user-phone').value,
      role: document.getElementById('user-role').value,
      preferred_language: document.getElementById('user-language').value
    };
    
    const password = document.getElementById('user-password').value;
    if (password) {
      formData.password = password;
    }

    try {
      let response;
      
      if (userId) {
        // Update existing user
        formData.is_active = true; // Assume active when updating
        response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new user
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        document.getElementById('user-modal').style.display = 'none';
        await this.loadUsers();
        this.adminManager.showSuccessMessage(userId ? 'User updated successfully' : 'User created successfully');
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('User submit error:', error);
      alert('Request failed');
    }
  }

  async editUser(userId) {
    this.openUserModal(userId);
  }

  async deactivateUser(userId) {
    if (confirm('Are you sure you want to deactivate this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          await this.loadUsers();
          this.adminManager.showSuccessMessage('User deactivated successfully');
        } else {
          alert(data.error || 'Deactivation failed');
        }
      } catch (error) {
        console.error('Deactivate user error:', error);
        alert('Request failed');
      }
    }
  }

  async activateUser(userId) {
    if (confirm('Are you sure you want to activate this user?')) {
      try {
        // Get current user data
        const response = await fetch(`/api/admin/users`);
        const users = await response.json();
        const user = users.find(u => u.id === userId);
        
        if (!user) {
          alert('User not found');
          return;
        }
        
        // Prepare data with current values, only changing is_active to true
        const updateData = {
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          role: user.role,
          preferred_language: user.preferred_language,
          is_active: true
        };
        
        // Make the PUT request to update the user
        const updateResponse = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const data = await updateResponse.json();
        
        if (data.success) {
          await this.loadUsers();
          this.adminManager.showSuccessMessage('User activated successfully');
        } else {
          alert(data.error || 'Activation failed');
        }
      } catch (error) {
        console.error('Activate user error:', error);
        alert('Request failed');
      }
    }
  }
}

// Make UsersManager available globally for browser use
if (typeof window !== 'undefined') {
  window.UsersManager = UsersManager;
}

// Export for other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UsersManager };
}