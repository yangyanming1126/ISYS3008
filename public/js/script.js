// ====================================
// Enhanced Service and Booking Management
// Sleepy Tiger Farmhouse
// ====================================

// 加载服务数据并进行分类展示 (Enhanced with multi-language support)
function loadServices() {
  // Get current language preference
  const currentLang = (window.languageManager && window.languageManager.currentLanguage) || 'en';
  
  fetch(`/api/services?lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      const serviceList = document.getElementById('service-list');
      const featuredServiceList = document.getElementById('featured-service-list');
      const serviceSelect = document.getElementById('service_id');

      if (serviceList) {
        displayServicesInList(data, serviceList);
      }
      
      if (featuredServiceList) {
        displayFeaturedServices(data, featuredServiceList);
      }

      // 填充 booking 页面的下拉框（如果存在）
      if (serviceSelect) {
        populateServiceSelect(data, serviceSelect);
      }
    })
    .catch(err => {
      console.error('Error loading services:', err);
      const serviceList = document.getElementById('service-list');
      if (serviceList) {
        serviceList.innerHTML = '<p>Failed to load services.</p>';
      }
    });
}

// Display services in the services page
function displayServicesInList(services, container) {
  if (services.length === 0) {
    container.innerHTML = '<p>No services available.</p>';
    return;
  }

  container.innerHTML = '';

  // 按 category 分组服务 (with localized category support)
  const grouped = {};
  services.forEach(service => {
    const categoryKey = service.localized_category || service.category;
    if (!grouped[categoryKey]) {
      grouped[categoryKey] = [];
    }
    grouped[categoryKey].push(service);
  });

  // 渲染每个分类
  for (const category in grouped) {
    const catHeader = document.createElement('h3');
    catHeader.textContent = category;
    container.appendChild(catHeader);

    grouped[category].forEach(service => {
      const card = document.createElement('div');
      card.className = 'service-card';
      
      // Use localized name and description if available
      const serviceName = service.localized_name || service.name;
      const serviceDescription = service.localized_description || service.description;
      
      card.innerHTML = `
        <h4>${serviceName}</h4>
        <p>${serviceDescription}</p>
        <p><strong>$${service.price}</strong></p>
        ${service.image_url ? 
          `<img src="${service.image_url}" alt="${serviceName}" style="max-width: 100%; border-radius: 6px; margin-top: 10px;" />` : 
          ''
        }
        <div class="service-actions" style="margin-top: 15px;">
          <a href="booking.html?service=${service.id}" class="cta-button" data-translate="book_now">${window.t ? window.t('book_now') : 'Book Now'}</a>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

// Display featured services on home page (limit to 3)
function displayFeaturedServices(services, container) {
  if (services.length === 0) {
    container.innerHTML = '<p>No featured services available.</p>';
    return;
  }

  // Show first 3 services as featured
  const featuredServices = services.slice(0, 3);
  
  container.innerHTML = featuredServices.map(service => {
    const serviceName = service.localized_name || service.name;
    const serviceDescription = service.localized_description || service.description;
    
    return `
      <div class="service-card">
        <h4>${serviceName}</h4>
        <p>${serviceDescription}</p>
        <p><strong>$${service.price}</strong></p>
        <a href="services.html" class="cta-button">${window.t ? window.t('explore_services') : 'View Details'}</a>
      </div>
    `;
  }).join('');
}

// Populate service select dropdown
function populateServiceSelect(services, selectElement) {
  // Clear existing options except the first one
  const firstOption = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = '';
  selectElement.appendChild(firstOption);
  
  // 按分类分组 (with localized category support)
  const categories = {};
  services.forEach(service => {
    const categoryKey = service.localized_category || service.category;
    if (!categories[categoryKey]) {
      categories[categoryKey] = [];
    }
    categories[categoryKey].push(service);
  });

  for (const cat in categories) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = cat;
    categories[cat].forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.localized_name || service.name;
      optgroup.appendChild(option);
    });
    selectElement.appendChild(optgroup);
  }
}

// Get URL parameters
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Pre-select service if coming from service page
function preselectService() {
  const serviceId = getURLParameter('service');
  if (serviceId) {
    const serviceSelect = document.getElementById('service_id');
    if (serviceSelect) {
      // Wait a bit for services to load
      setTimeout(() => {
        serviceSelect.value = serviceId;
      }, 1000);
    }
  }
}

// Enhanced date validation with MM/DD/YYYY format
function validateAndFormatDate(dateInput) {
  if (!dateInput) return false;
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Check if date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    alert(window.t ? window.t('error_message') : 'Please select a future date.');
    return false;
  }
  
  // Format as YYYY-MM-DD for backend
  return date.toISOString().split('T')[0];
}

// 初始化加载服务数据
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  preselectService();
});

// Reload services when language changes
document.addEventListener('languageChanged', () => {
  loadServices();
});

// Auto-fill user information when auth status is confirmed
document.addEventListener('authStatusChecked', () => {
  // Auto-fill user info if logged in
  autoFillUserInfo();
});

// Auto-fill user information if logged in
function autoFillUserInfo() {
  // Only run on booking page
  if (!document.getElementById('booking-form')) return;
  
  // Check if user is logged in
  if (window.currentUser) {
    const nameField = document.getElementById('name');
    const phoneField = document.getElementById('phone');
    
    // Fill name field if empty
    if (nameField && !nameField.value) {
      nameField.value = `${window.currentUser.first_name} ${window.currentUser.last_name}`;
    }
    
    // Fill phone field if empty and phone info is available
    if (phoneField && !phoneField.value && window.currentUser.phone) {
      phoneField.value = window.currentUser.phone;
    }
  }
}

// 处理预约表单提交（仅在 booking.html 中触发）
if (document.getElementById('booking-form')) {
  document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if user is logged in using authManager if available
    if (window.authManager) {
      // If authManager exists but user is not authenticated, redirect to login
      if (!window.authManager.currentUser) {
        alert(window.t ? window.t('login_required') : 'Please login to complete your booking');
        window.location.href = 'login.html';
        return;
      }
    } else {
      // Fallback to window.currentUser if authManager is not available
      if (!window.currentUser) {
        alert(window.t ? window.t('login_required') : 'Please login to complete your booking');
        window.location.href = 'login.html';
        return;
      }
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dateInput = document.getElementById('date').value;
    const service_id = document.getElementById('service_id').value;
    const notes = document.getElementById('notes') ? document.getElementById('notes').value.trim() : '';

    // Validate required fields
    if (!name || !phone || !dateInput || !service_id) {
      alert(window.t ? window.t('error_message') : 'Please fill in all required fields.');
      return;
    }

    // Validate and format date
    const formattedDate = validateAndFormatDate(dateInput);
    if (!formattedDate) {
      return;
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          phone, 
          date: formattedDate, 
          service_id: parseInt(service_id),
          notes 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Show payment modal if service has a price
        if (data.service_price > 0) {
          showPaymentModal({
            booking_id: data.booking_id,
            service_name: getServiceName(service_id),
            amount: data.service_price,
            customer_name: name,
            customer_phone: phone
          });
        } else {
          const successMsg = window.t ? window.t('success_message') : 'Booking successful!';
          alert(`${successMsg} Booking ID: ${data.booking_id}`);
          
          // Reset form and redirect
          document.getElementById('booking-form').reset();
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 2000);
        }
      } else if (response.status === 403) {
        // Email not verified
        alert(data.error || (window.t ? window.t('email_not_verified_booking') : 'Please verify your email address before making bookings.'));
      } else {
        alert('Booking failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking request failed:', error);
      alert(window.t ? window.t('error_message') : 'Booking request failed: ' + error.message);
    }
  });

  // Initialize payment modal functionality
  initializePaymentModal();
}

// Get service name by ID
function getServiceName(serviceId) {
  const selectElement = document.getElementById('service_id');
  const option = selectElement.querySelector(`option[value="${serviceId}"]`);
  return option ? option.textContent : 'Unknown Service';
}

// Show payment modal
function showPaymentModal(bookingData) {
  const modal = document.getElementById('payment-modal');
  const serviceName = document.getElementById('payment-service-name');
  const amount = document.getElementById('payment-amount');
  const customerInfo = document.getElementById('payment-customer-info');
  
  serviceName.textContent = bookingData.service_name;
  const numericAmount = parseFloat(bookingData.amount) || 0;
  amount.textContent = `$${numericAmount.toFixed(2)}`;
  customerInfo.textContent = `${bookingData.customer_name} - ${bookingData.customer_phone}`;
  
  // Store booking data for payment processing
  modal.dataset.bookingId = bookingData.booking_id;
  modal.dataset.amount = numericAmount;
  
  modal.style.display = 'flex';
}

// Hide payment modal
function hidePaymentModal() {
  const modal = document.getElementById('payment-modal');
  modal.style.display = 'none';
}

// Initialize payment modal event listeners
function initializePaymentModal() {
  const modal = document.getElementById('payment-modal');
  const closeBtn = document.getElementById('payment-close');
  const confirmBtn = document.getElementById('confirm-payment-btn');
  const counterBtn = document.getElementById('checkout-counter-btn');
  const cancelBtn = document.getElementById('cancel-payment-btn');
  
  if (!modal) return;
  
  // Close modal events
  closeBtn.addEventListener('click', hidePaymentModal);
  cancelBtn.addEventListener('click', hidePaymentModal);
  
  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hidePaymentModal();
    }
  });
  
  // Confirm payment
  confirmBtn.addEventListener('click', async () => {
    const bookingId = modal.dataset.bookingId;
    const amount = modal.dataset.amount;
    
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = window.t ? window.t('loading') : 'Processing...';
      
      const paymentResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          booking_id: bookingId,
          payment_method: 'virtual'
        })
      });
      
      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        alert(window.t('payment_successful') || 'Payment successful! Transaction ID: ' + paymentData.payment.transaction_id);
        hidePaymentModal();
        
        // Reset form and redirect
        document.getElementById('booking-form').reset();
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 2000);
      } else {
        alert('Payment failed: ' + paymentData.error);
      }
    } catch (paymentError) {
      console.error('Payment error:', paymentError);
      alert('Payment request failed. You can pay later from your profile.');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = window.t ? window.t('confirm_payment') : 'Confirm Payment';
    }
  });
  
  // Checkout at the counter
  counterBtn.addEventListener('click', async () => {
    const bookingId = modal.dataset.bookingId;
    
    try {
      counterBtn.disabled = true;
      counterBtn.textContent = window.t ? window.t('loading') : 'Processing...';
      
      // Update booking status to indicate counter checkout
      const response = await fetch(`/api/bookings/${bookingId}/counter-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(window.t('checkout_counter_success') || 'Booking confirmed! Please complete your payment at the counter.');
        hidePaymentModal();
        
        // Reset form and redirect to home page
        document.getElementById('booking-form').reset();
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        alert('Checkout failed: ' + data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout request failed.');
    } finally {
      counterBtn.disabled = false;
      counterBtn.textContent = window.t ? window.t('checkout_counter') : 'Checkout at the Counter';
    }
  });
}
