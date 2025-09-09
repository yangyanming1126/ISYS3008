// ====================================
// Admin Dashboard Management System
// Sleepy Tiger Farmhouse
// ====================================

class AdminManager {
  constructor() {
    console.log('AdminManager constructor called');
    this.currentTab = 'users';
    this.users = [];
    this.bookings = [];
    this.services = [];
    console.log('AdminManager constructor completed');
  }

  async init() {
    console.log('AdminManager init() method called');
    try {
      console.log('Calling bindEvents...');
      this.bindEvents();
      console.log('bindEvents completed, calling showTab...');
      this.showTab('users');
      console.log('showTab completed, calling loadAllData...');
      await this.loadAllData();
      console.log('AdminManager initialization completed successfully');
    } catch (error) {
      console.error('Error during AdminManager initialization:', error);
      throw error;
    }
  }

  bindEvents() {
    // Tab navigation
    console.log('Binding tab events...');
    const usersTab = document.getElementById('users-tab');
    const bookingsTab = document.getElementById('bookings-tab');
    const servicesTab = document.getElementById('services-tab');
    
    console.log('Tab elements found:', { usersTab, bookingsTab, servicesTab });
    
    if (usersTab) {
      usersTab.addEventListener('click', () => {
        console.log('Users tab clicked');
        this.showTab('users');
      });
    }
    
    if (bookingsTab) {
      bookingsTab.addEventListener('click', () => {
        console.log('Bookings tab clicked');
        this.showTab('bookings');
      });
    }
    
    if (servicesTab) {
      servicesTab.addEventListener('click', () => {
        console.log('Services tab clicked');
        this.showTab('services');
      });
    }

    // Create buttons
    document.getElementById('create-user-btn').addEventListener('click', () => this.openUserModal());
    document.getElementById('create-service-btn').addEventListener('click', () => this.openServiceModal());

    // Modal events
    this.bindModalEvents();

    // Filter events
    document.getElementById('booking-status-filter').addEventListener('change', (e) => {
      this.filterBookings(e.target.value);
    });
  }

  bindModalEvents() {
    // Close modals
    document.querySelectorAll('.close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
      });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // Form submissions
    document.getElementById('user-form').addEventListener('submit', (e) => this.handleUserSubmit(e));
    document.getElementById('booking-form').addEventListener('submit', (e) => this.handleBookingSubmit(e));

    // Cancel buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
      });
    });
  }

  showTab(tabName) {
    console.log(`Showing tab: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    console.log('Tab buttons found:', tabButtons.length);
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = document.getElementById(`${tabName}-tab`);
    console.log(`Active tab element (${tabName}-tab):`, activeTab);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    // Update panels
    const panels = document.querySelectorAll('.admin-panel');
    console.log('Admin panels found:', panels.length);
    panels.forEach(panel => panel.classList.remove('active'));
    
    const activePanel = document.getElementById(`${tabName}-panel`);
    console.log(`Active panel element (${tabName}-panel):`, activePanel);
    if (activePanel) {
      activePanel.classList.add('active');
    }

    this.currentTab = tabName;
    console.log(`Current tab set to: ${this.currentTab}`);
  }

  async loadAllData() {
    await Promise.all([
      this.loadUsers(),
      this.loadBookings(),
      this.loadServices()
    ]);
  }

  // ====================================
  // USERS MANAGEMENT
  // ====================================

  async loadUsers() {
    try {
      const response = await fetch('/api/admin/users');
      
      if (response.ok) {
        const users = await response.json();
        this.displayUsers(users);
      } else {
        this.showError('users-table', 'Failed to load users');
      }
    } catch (error) {
      console.error('Load users error:', error);
      this.showError('users-table', 'Error loading users');
    }
  }

  displayUsers(users) {
    const tbody = document.querySelector('#users-table tbody');
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan=\"7\">No users found</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.first_name} ${user.last_name}</td>
        <td>
          <span class=\"role-badge role-${user.role}\">${user.role}</span>
        </td>
        <td>
          <span class=\"status-badge ${user.is_active ? 'active' : 'inactive'}\">
            ${user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class=\"actions\">
          <button onclick=\"adminManager.editUser(${user.id})\" class=\"btn-edit\">Edit</button>
          ${user.is_active ? 
            `<button onclick=\"adminManager.deactivateUser(${user.id})\" class=\"btn-delete\">Deactivate</button>` :
            `<button onclick=\"adminManager.activateUser(${user.id})\" class=\"btn-activate\">Activate</button>`
          }
        </td>
      </tr>
    `).join('');
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
        this.showSuccessMessage(userId ? 'User updated successfully' : 'User created successfully');
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
          this.showSuccessMessage('User deactivated successfully');
        } else {
          alert(data.error || 'Deactivation failed');
        }
      } catch (error) {
        console.error('Deactivate user error:', error);
        alert('Request failed');
      }
    }
  }

  // ====================================
  // BOOKINGS MANAGEMENT
  // ====================================

  async loadBookings() {
    try {
      const response = await fetch('/api/admin/bookings');
      
      if (response.ok) {
        const bookings = await response.json();
        this.allBookings = bookings; // Store for filtering
        this.displayBookings(bookings);
      } else {
        this.showError('bookings-table', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      this.showError('bookings-table', 'Error loading bookings');
    }
  }

  displayBookings(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan=\"7\">No bookings found</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map(booking => {
      const paymentStatus = booking.payment_status === 'completed' ? 'Paid' : 'Unpaid';
      const paymentClass = booking.payment_status === 'completed' ? 'paid' : 'unpaid';
      
      return `
        <tr>
          <td>${booking.id}</td>
          <td>
            ${booking.name}<br>
            <small>${booking.phone}</small>
            ${booking.username ? `<br><small>User: ${booking.username}</small>` : ''}
          </td>
          <td>${booking.service_name}</td>
          <td>${this.formatDate(booking.date)}</td>
          <td>
            <span class=\"status status-${booking.status}\">${this.capitalizeFirst(booking.status)}</span>
          </td>
          <td>
            <span class=\"payment-status ${paymentClass}\">${paymentStatus}</span>
            ${booking.paid_amount ? `<br><small>$${booking.paid_amount}</small>` : ''}
          </td>
          <td class=\"actions\">
            <button onclick=\"adminManager.editBooking(${booking.id})\" class=\"btn-edit\">Edit</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  filterBookings(status) {
    if (!this.allBookings) return;
    
    const filteredBookings = status ? 
      this.allBookings.filter(booking => booking.status === status) : 
      this.allBookings;
    
    this.displayBookings(filteredBookings);
  }

  async editBooking(bookingId) {
    const booking = this.allBookings.find(b => b.id === bookingId);
    
    if (booking) {
      document.getElementById('booking-id').value = bookingId;
      document.getElementById('booking-status').value = booking.status;
      document.getElementById('booking-notes').value = booking.notes || '';
      
      document.getElementById('booking-modal').style.display = 'block';
    }
  }

  async handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingId = document.getElementById('booking-id').value;
    const formData = {
      status: document.getElementById('booking-status').value,
      notes: document.getElementById('booking-notes').value
    };

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        document.getElementById('booking-modal').style.display = 'none';
        await this.loadBookings();
        this.showSuccessMessage('Booking updated successfully');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Booking update error:', error);
      alert('Request failed');
    }
  }

  // ====================================
  // SERVICES MANAGEMENT
  // ====================================

  async loadServices() {
    try {
      const response = await fetch('/api/admin/services');
      
      if (response.ok) {
        const services = await response.json();
        this.displayServices(services);
      } else {
        this.showError('services-table', 'Failed to load services');
      }
    } catch (error) {
      console.error('Load services error:', error);
      this.showError('services-table', 'Error loading services');
    }
  }

  displayServices(services) {
    const tbody = document.querySelector('#services-table tbody');
    
    if (services.length === 0) {
      tbody.innerHTML = '<tr><td colspan=\"6\">No services found</td></tr>';
      return;
    }

    tbody.innerHTML = services.map(service => `
      <tr>
        <td>${service.id}</td>
        <td>${service.name}</td>
        <td>${service.category}</td>
        <td>$${service.price}</td>
        <td>
          <span class=\"status-badge ${service.is_active ? 'active' : 'inactive'}\">
            ${service.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class=\"actions\">
          <button onclick=\"adminManager.editService(${service.id})\" class=\"btn-edit\">Edit</button>
          ${service.is_active ? 
            `<button onclick=\"adminManager.deactivateService(${service.id})\" class=\"btn-delete\">Deactivate</button>` :
            `<button onclick=\"adminManager.activateService(${service.id})\" class=\"btn-activate\">Activate</button>`
          }
        </td>
      </tr>
    `).join('');
  }

  openServiceModal(serviceId = null) {
    // Service creation/editing would be implemented here
    // For now, show a simple alert
    alert('Service management functionality will be implemented in the next update.');
  }

  async editService(serviceId) {
    this.openServiceModal(serviceId);
  }

  async deactivateService(serviceId) {
    if (confirm('Are you sure you want to deactivate this service?')) {
      try {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          await this.loadServices();
          this.showSuccessMessage('Service deactivated successfully');
        } else {
          alert(data.error || 'Deactivation failed');
        }
      } catch (error) {
        console.error('Deactivate service error:', error);
        alert('Request failed');
      }
    }
  }

  // ====================================
  // UTILITY METHODS
  // ====================================

  showError(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const colSpan = document.querySelector(`#${tableId} thead tr`).children.length;
    tbody.innerHTML = `<tr><td colspan=\"${colSpan}\">${message}</td></tr>`;
  }

  showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d4edda;
      color: #155724;
      padding: 15px 20px;
      border-radius: 5px;
      border: 1px solid #c3e6cb;
      z-index: 1001;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ====================================
// Initialize Admin Manager
// ====================================
let adminManager;

// AdminManager is now initialized from admin.html after dynamic loading
// No DOMContentLoaded listener needed here

// Make AdminManager available globally for browser use
if (typeof window !== 'undefined') {
  window.AdminManager = AdminManager;
}

// Export for other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdminManager };
}