// ====================================
// Bookings Management Module
// Sleepy Tiger Farmhouse
// ====================================

class BookingsManager {
  constructor(adminManager) {
    this.adminManager = adminManager;
    this.allBookings = [];
  }

  async loadBookings() {
    try {
      const response = await fetch('/api/admin/bookings');
      
      if (response.ok) {
        const bookings = await response.json();
        this.allBookings = bookings; // Store for filtering
        this.displayBookings(bookings);
      } else {
        this.adminManager.showError('bookings-table', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      this.adminManager.showError('bookings-table', 'Error loading bookings');
    }
  }

  displayBookings(bookings) {
    const tbody = document.querySelector('#bookings-table tbody');
    
    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" data-translate="no_bookings_found">No bookings found</td></tr>`;
      // Translate the new content
      if (window.languageManager) {
        window.languageManager.translatePage();
      }
      return;
    }

    tbody.innerHTML = bookings.map(booking => {
      // Generate action buttons based on booking status
      let actionButtons = '';
      if (booking.status === 'pending') {
        actionButtons = `
          <button class="btn-approve" data-booking-id="${booking.id}" data-translate="approve">Approve</button>
          <button class="btn-reject" data-booking-id="${booking.id}" data-translate="reject">Reject</button>
        `;
      } else if (booking.status === 'confirmed') {
        actionButtons = `
          <button class="btn-view" data-booking-id="${booking.id}" data-translate="view">View</button>
          <button class="btn-complete" data-booking-id="${booking.id}" data-translate="complete">Complete</button>
        `;
      } else {
        actionButtons = `<button class="btn-view" data-booking-id="${booking.id}" data-translate="view">View</button>`;
      }
      
      // Always include Delete button for admins
      actionButtons += `\n<button class="btn-delete" data-booking-id="${booking.id}" data-translate="delete">Delete</button>`;
      
      // Get status translation key
      const statusKey = `status_${booking.status}`;
      
      // Add payment method information if available
      let paymentInfo = '';
      if (booking.payment_method) {
        paymentInfo = `<br><small>Payment: ${booking.payment_method}</small>`;
      } else if (booking.status === 'confirmed') {
        paymentInfo = '<br><small>Payment: At Counter</small>';
      }
      
      return `
        <tr>
          <td>${booking.id}</td>
          <td>
            ${booking.name}<br>
            <small>${booking.phone}</small>
            ${booking.username ? `<br><small data-translate="username_label">User</small>: ${booking.username}</small>` : ''}
            ${paymentInfo}
          </td>
          <td>${booking.service_name}</td>
          <td>${this.adminManager.formatDate(booking.date)}</td>
          <td>
            <span class="status-badge status-${booking.status}" data-translate="${statusKey}">${this.adminManager.capitalizeFirst(booking.status)}</span>
          </td>
          <td class="actions">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');
    
    // Translate the new content
    if (window.languageManager) {
      window.languageManager.translatePage();
    }
    
    // Add event listeners to action buttons
    this.bindBookingActionEvents();
  }
  
  bindBookingActionEvents() {
    // Make sure the DOM is ready
    if (!document.querySelector('#bookings-table')) {
      console.warn('Bookings table not found, skipping event binding');
      return;
    }
    
    // Bind approve buttons
    const approveButtons = document.querySelectorAll('.btn-approve');
    approveButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
        if (!isNaN(bookingId) && this.approveBooking) {
          this.approveBooking(bookingId);
        } else {
          console.error('Invalid booking ID or approveBooking method not available');
        }
      });
    });
    
    // Bind reject buttons
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
        if (!isNaN(bookingId) && this.rejectBooking) {
          this.rejectBooking(bookingId);
        } else {
          console.error('Invalid booking ID or rejectBooking method not available');
        }
      });
    });
    
    // Bind view buttons
    const viewButtons = document.querySelectorAll('.btn-view');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
        if (!isNaN(bookingId) && this.viewBooking) {
          this.viewBooking(bookingId);
        } else {
          console.error('Invalid booking ID or viewBooking method not available');
        }
      });
    });
    
    // Bind complete buttons
    const completeButtons = document.querySelectorAll('.btn-complete');
    completeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
        if (!isNaN(bookingId) && this.completeBooking) {
          this.completeBooking(bookingId);
        } else {
          console.error('Invalid booking ID or completeBooking method not available');
        }
      });
    });

    // Bind delete buttons
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Only handle delete buttons with data-booking-id
        if (!e.target.hasAttribute('data-booking-id')) return;
        const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
        if (!isNaN(bookingId) && this.deleteBooking) {
          this.deleteBooking(bookingId);
        } else {
          console.error('Invalid booking ID or deleteBooking method not available');
        }
      });
    });
  }

  filterBookings(status) {
    if (!this.allBookings) return;
    
    const filteredBookings = status ? 
      this.allBookings.filter(booking => booking.status === status) : 
      this.allBookings;
    
    this.displayBookings(filteredBookings);
  }

  async editBooking(bookingId) {
    // This method is no longer used as we now use viewBooking instead
    // const booking = this.allBookings.find(b => b.id === bookingId);
    // 
    // if (booking) {
    //   document.getElementById('booking-id').value = bookingId;
    //   document.getElementById('booking-status').value = booking.status;
    //   document.getElementById('booking-notes').value = booking.notes || '';
    //   // 
    //   document.getElementById('booking-modal').style.display = 'block';
    // }
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
        this.adminManager.showSuccessMessage('Booking updated successfully');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Booking update error:', error);
      alert('Request failed');
    }
  }

  // ====================================
  // BOOKING APPROVAL/REJECTION
  // ====================================

  async viewBooking(bookingId) {
    const booking = this.allBookings.find(b => b.id === bookingId);
    
    if (booking) {
      // Create a modal to display booking details
      this.showBookingDetailsModal(booking);
    }
  }

  showBookingDetailsModal(booking) {
    // Create or update modal content
    let modal = document.getElementById('booking-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'booking-details-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h3 data-translate="booking_details_title">Booking Details</h3>
            <span class="close">&times;</span>
          </div>
          <div class="modal-body">
            <!-- Booking details will be inserted here -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listener to close button
      modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      // Close modal when clicking outside of it
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
    
    // Get status translation key
    const statusKey = `status_${booking.status}`;
    
    // Populate modal with booking details
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
      <div class="booking-details">
        <div class="detail-row">
          <span class="detail-label" data-translate="booking_id_label">Booking ID:</span>
          <span class="detail-value">${booking.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" data-translate="customer_name_label">Customer Name:</span>
          <span class="detail-value">${booking.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" data-translate="phone_label">Phone:</span>
          <span class="detail-value">${booking.phone}</span>
        </div>
        ${booking.username ? `
        <div class="detail-row">
          <span class="detail-label" data-translate="username_label">Username:</span>
          <span class="detail-value">${booking.username}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="detail-label" data-translate="service_label">Service:</span>
          <span class="detail-value">${booking.service_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" data-translate="date_label">Date:</span>
          <span class="detail-value">${this.adminManager.formatDate(booking.date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" data-translate="status_label">Status:</span>
          <span class="detail-value">
            <span class="status-badge status-${booking.status}" data-translate="${statusKey}">${this.adminManager.capitalizeFirst(booking.status)}</span>
          </span>
        </div>
        ${booking.notes ? `
        <div class="detail-row">
          <span class="detail-label" data-translate="notes_label">Notes:</span>
          <span class="detail-value">${booking.notes}</span>
        </div>` : ''}
        ${booking.paid_amount ? `
        <div class="detail-row">
          <span class="detail-label" data-translate="paid_amount_label">Paid Amount:</span>
          <span class="detail-value">${booking.paid_amount}</span>
        </div>` : ''}
        ${booking.transaction_id ? `
        <div class="detail-row">
          <span class="detail-label" data-translate="transaction_id_label">Transaction ID:</span>
          <span class="detail-value">${booking.transaction_id}</span>
        </div>` : ''}
      </div>
    `;
    
    // Translate the new content
    if (window.languageManager) {
      window.languageManager.translatePage();
    }
    
    // Show the modal
    modal.style.display = 'block';
  }

  async approveBooking(bookingId) {
    if (!confirm('Are you sure you want to approve this booking?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadBookings();
        this.adminManager.showSuccessMessage('Booking approved successfully');
      } else {
        alert(data.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Booking approval error:', error);
      alert('Request failed');
    }
  }

  async rejectBooking(bookingId) {
    if (!confirm('Are you sure you want to reject this booking? This will mark it as refunded.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadBookings();
        this.adminManager.showSuccessMessage('Booking rejected successfully');
      } else {
        alert(data.error || 'Rejection failed');
      }
    } catch (error) {
      console.error('Booking rejection error:', error);
      alert('Request failed');
    }
  }

  async completeBooking(bookingId) {
    if (!confirm('Are you sure you want to mark this booking as completed?')) {
      return;
    }
    
    try {
      // Send request to update booking status to completed
      const response = await fetch(`/api/admin/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadBookings();
        this.adminManager.showSuccessMessage('Booking marked as completed successfully');
      } else {
        alert(data.error || 'Failed to mark booking as completed');
      }
    } catch (error) {
      console.error('Booking completion error:', error);
      alert('Request failed');
    }
  }

  async deleteBooking(bookingId) {
    const confirmMsg = (window.t && window.t('confirm_delete_booking')) || 'Are you sure you want to delete this booking? This action cannot be undone.';
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        await this.loadBookings();
        this.adminManager.showSuccessMessage('Booking deleted successfully');
      } else {
        alert(data.error || 'Deletion failed');
      }
    } catch (error) {
      console.error('Delete booking error:', error);
      alert('Request failed');
    }
  }
}

// Make BookingsManager available globally for browser use
if (typeof window !== 'undefined') {
  window.BookingsManager = BookingsManager;
}

// Export for other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BookingsManager };
}