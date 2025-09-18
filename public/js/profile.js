// ====================================
// Profile Management System
// Sleepy Tiger Farmhouse
// ====================================

class ProfileManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadProfile();
    await this.loadUserBookings();
    this.bindEvents();
  }

  async loadProfile() {
    try {
      const response = await fetch('/api/auth/profile');
      
      if (response.ok) {
        const data = await response.json();
        this.populateProfileForm(data.user);
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  }

  populateProfileForm(user) {
    const fields = {
      'profile_first_name': user.first_name,
      'profile_last_name': user.last_name,
      'profile_phone': user.phone || ''
    };

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value;
      }
    });
    
    // Handle language preference separately
    const languageElement = document.getElementById('profile_language');
    if (languageElement) {
      languageElement.value = window.languageManager?.currentLanguage || 'en';
    }
  }

  async loadUserBookings() {
    const bookingsContainer = document.getElementById('user-bookings');
    
    if (!bookingsContainer) return;

    try {
      const response = await fetch('/api/bookings/my');
      
      if (response.ok) {
        const bookings = await response.json();
        this.displayBookings(bookings, bookingsContainer);
      } else {
        bookingsContainer.innerHTML = '<p>Failed to load bookings</p>';
      }
    } catch (error) {
      console.error('Bookings load error:', error);
      bookingsContainer.innerHTML = '<p>Error loading bookings</p>';
    }
  }

  displayBookings(bookings, container) {
    if (bookings.length === 0) {
      container.innerHTML = '<p data-translate="no_bookings_found">No bookings found</p>';
      // Translate the new content
      if (window.languageManager) {
        window.languageManager.translatePage();
      }
      return;
    }

    const bookingsHTML = bookings.map(booking => {
      const statusClass = this.getStatusClass(booking.status);
      
      // Get service name (English only)
      const serviceName = booking.service_name_en || 'Unnamed Service';
      
      return `
        <div class="booking-item">
          <div class="booking-header">
            <h4>${serviceName}</h4>
            <span class="status ${statusClass}" data-translate="status_${booking.status}">${this.translateStatus(booking.status)}</span>
          </div>
          
          <div class="booking-details">
            <p><strong data-translate="date_label">Date:</strong> ${this.formatDate(booking.date)}</p>
            <p><strong data-translate="customer_label">Customer:</strong> ${booking.name}</p>
            <p><strong data-translate="phone_label">Phone:</strong> ${booking.phone}</p>
            <p><strong data-translate="price_label">Price:</strong> ${booking.service_price}</p>
            
            ${booking.notes ? `<p><strong data-translate="notes_label">Notes:</strong> ${booking.notes}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = bookingsHTML;
    
    // Translate the new content
    if (window.languageManager) {
      window.languageManager.translatePage();
    }
  }

  async processPayment(bookingId, amount) {
    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          payment_method: 'virtual'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(window.t('payment_successful') || 'Virtual payment successful!');
        // Reload bookings to show updated payment status
        await this.loadUserBookings();
      } else {
        alert(data.error || (window.t('payment_failed') || 'Payment failed'));
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(window.t('payment_failed') || 'Payment request failed');
    }
  }

  getStatusClass(status) {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'cancelled': 'status-cancelled',
      'completed': 'status-completed'
    };
    return statusClasses[status] || '';
  }

  translateStatus(status) {
    const translations = {
      'pending': window.t('status_pending') || 'Pending',
      'confirmed': window.t('status_confirmed') || 'Confirmed',
      'cancelled': window.t('status_cancelled') || 'Cancelled',
      'completed': window.t('status_completed') || 'Completed'
    };
    return translations[status] || status;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  bindEvents() {
    // Profile form is handled by auth.js
    // Any additional profile-specific events can be added here
  }
}

// ====================================
// Initialize Profile Manager
// ====================================
let profileManager;

document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on profile page
  if (window.location.pathname.includes('profile.html')) {
    profileManager = new ProfileManager();
    window.profileManager = profileManager;
  }
});

// Language change event listener
document.addEventListener('languageChanged', () => {
  // Reload bookings when language changes
  if (profileManager) {
    profileManager.loadUserBookings();
  }
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfileManager };
}