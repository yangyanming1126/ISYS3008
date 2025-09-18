// ====================================
// Admin Dashboard Management System
// Sleepy Tiger Farmhouse
// ====================================

class AdminManager {
  constructor() {
    console.log('AdminManager constructor called');
    this.currentTab = 'users';
    console.log('AdminManager constructor completed');
  }

  async init() {
    console.log('AdminManager init() method called');
    try {
      // Initialize the managers for each tab
      this.usersManager = new UsersManager(this);
      this.bookingsManager = new BookingsManager(this);
      this.servicesManager = new ServicesManager(this);
      
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
    document.getElementById('create-user-btn').addEventListener('click', () => {
      if (this.usersManager) {
        this.usersManager.openUserModal();
      }
    });
    
    document.getElementById('create-service-btn').addEventListener('click', () => {
      if (this.servicesManager) {
        this.servicesManager.openServiceModal();
      }
    });

    // Modal events
    this.bindModalEvents();

    // Filter events
    document.getElementById('booking-status-filter').addEventListener('change', (e) => {
      if (this.bookingsManager) {
        this.bookingsManager.filterBookings(e.target.value);
      }
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
    document.getElementById('user-form').addEventListener('submit', (e) => {
      if (this.usersManager) {
        this.usersManager.handleUserSubmit(e);
      }
    });
    
    document.getElementById('booking-form').addEventListener('submit', (e) => {
      if (this.bookingsManager) {
        this.bookingsManager.handleBookingSubmit(e);
      }
    });
    
    document.getElementById('service-form').addEventListener('submit', (e) => {
      if (this.servicesManager) {
        this.servicesManager.handleServiceSubmit(e);
      }
    });

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
      this.usersManager ? this.usersManager.loadUsers() : Promise.resolve(),
      this.bookingsManager ? this.bookingsManager.loadBookings() : Promise.resolve(),
      this.servicesManager ? this.servicesManager.loadServices() : Promise.resolve()
    ]);
  }

  // ====================================
  // UTILITY METHODS
  // ====================================

  showError(tableId, message) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const colSpan = document.querySelector(`#${tableId} thead tr`).children.length;
    tbody.innerHTML = `<tr><td colspan="${colSpan}">${message}</td></tr>`;
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