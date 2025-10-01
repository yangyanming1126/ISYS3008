// ====================================
// Services Management Module
// Sleepy Tiger Farmhouse
// ====================================

class ServicesManager {
  constructor(adminManager) {
    this.adminManager = adminManager;
  }

  async loadServices() {
    try {
      const response = await fetch('/api/admin/services');
      
      if (response.ok) {
        const services = await response.json();
        this.displayServices(services);
      } else {
        this.adminManager.showError('services-table', 'Failed to load services');
      }
    } catch (error) {
      console.error('Load services error:', error);
      this.adminManager.showError('services-table', 'Error loading services');
    }
  }

  displayServices(services) {
    const tbody = document.querySelector('#services-table tbody');
    
    if (services.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" data-translate="no_services_found">No services found</td></tr>`;
      // Translate the new content
      if (window.languageManager) {
        window.languageManager.translatePage();
      }
      return;
    }

    tbody.innerHTML = services.map(service => {
      // Get status translation keys
      const statusKey = service.is_active ? 'status_active' : 'status_inactive';
      const statusText = service.is_active ? 'Active' : 'Inactive';
      
      return `
        <tr>
          <td>${service.id}</td>
          <td>${service.display_name || service.name_en || service.name_cn || service.name_ru || 'N/A'}</td>
          <td>${service.display_category || service.category_en || service.category_cn || service.category_ru || 'N/A'}</td>
          <td>${service.price}</td>
          <td>
            <span class="status-badge ${service.is_active ? 'active' : 'inactive'}" data-translate="${statusKey}">${statusText}</span>
          </td>
          <td class="actions">
            <button data-action="edit" data-service-id="${service.id}" class="btn-edit" data-translate="edit">Edit</button>
            ${service.is_active ? 
              `<button data-action="deactivate" data-service-id="${service.id}" class="btn-delete" data-translate="deactivate">Deactivate</button>` :
              `<button data-action="activate" data-service-id="${service.id}" class="btn-activate" data-translate="activate">Activate</button>`
            }
            <button data-action="delete-permanent" data-service-id="${service.id}" class="btn-delete" data-translate="delete">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Translate the new content
    if (window.languageManager) {
      window.languageManager.translatePage();
    }
    
    // Add event listeners to action buttons
    this.bindServiceActionEvents(services);
  }

  // Add event listeners to action buttons
  bindServiceActionEvents(services) {
    // Bind edit buttons
    const editButtons = document.querySelectorAll('[data-action="edit"]');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const serviceId = parseInt(e.target.getAttribute('data-service-id'));
        if (!isNaN(serviceId) && this.editService) {
          this.editService(serviceId);
        } else {
          console.error('Invalid service ID or editService method not available');
        }
      });
    });
    
    // Bind deactivate buttons
    const deactivateButtons = document.querySelectorAll('[data-action="deactivate"]');
    deactivateButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const serviceId = parseInt(e.target.getAttribute('data-service-id'));
        if (!isNaN(serviceId) && this.deactivateService) {
          this.deactivateService(serviceId);
        } else {
          console.error('Invalid service ID or deactivateService method not available');
        }
      });
    });
    
    // Bind activate buttons
    const activateButtons = document.querySelectorAll('[data-action="activate"]');
    activateButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const serviceId = parseInt(e.target.getAttribute('data-service-id'));
        if (!isNaN(serviceId) && this.activateService) {
          this.activateService(serviceId);
        } else {
          console.error('Invalid service ID or activateService method not available');
        }
      });
    });

    // Bind permanent delete buttons
    const deleteButtons = document.querySelectorAll('[data-action="delete-permanent"]');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const serviceId = parseInt(e.target.getAttribute('data-service-id'));
        if (!isNaN(serviceId) && this.deleteServicePermanently) {
          this.deleteServicePermanently(serviceId);
        } else {
          console.error('Invalid service ID or deleteServicePermanently method not available');
        }
      });
    });
  }

  openServiceModal(serviceId = null) {
    const modal = document.getElementById('service-modal');
    const title = document.getElementById('service-modal-title');
    const form = document.getElementById('service-form');
    
    // Reset form
    form.reset();
    document.getElementById('service-id').value = serviceId || '';
    
    // Set default status to active
    document.getElementById('service-status').value = 'true';
    
    if (serviceId) {
      // Edit mode
      title.textContent = 'Edit Service';
      this.loadServiceData(serviceId);
    } else {
      // Create mode
      title.textContent = 'Create Service';
    }
    
    // Show modal
    modal.style.display = 'block';
  }

  async loadServiceData(serviceId) {
    try {
      // Get service data from the table for now (could also fetch from API)
      const services = await fetch('/api/admin/services').then(r => r.json());
      const service = services.find(s => s.id == serviceId);
      
      if (service) {
        // Fill form with service data
        document.getElementById('service-name-en').value = service.name_en || '';
        document.getElementById('service-name-cn').value = service.name_cn || '';
        document.getElementById('service-name-ru').value = service.name_ru || '';
        
        document.getElementById('service-description-en').value = service.description_en || '';
        document.getElementById('service-description-cn').value = service.description_cn || '';
        document.getElementById('service-description-ru').value = service.description_ru || '';
        
        document.getElementById('service-category-en').value = service.category_en || '';
        document.getElementById('service-category-cn').value = service.category_cn || '';
        document.getElementById('service-category-ru').value = service.category_ru || '';
        
        document.getElementById('service-price').value = service.price || '';
        document.getElementById('service-image-url').value = service.image_url || '';
        document.getElementById('service-status').value = service.is_active.toString();
      }
    } catch (error) {
      console.error('Load service data error:', error);
    }
  }

  async editService(serviceId) {
    this.openServiceModal(serviceId);
  }

  async deactivateService(serviceId) {
    const msg = (window.t && window.t('confirm_deactivate_service')) || 'Are you sure you want to deactivate this service?';
    if (confirm(msg)) {
      try {
        const response = await fetch(`/api/admin/services/${serviceId}`, {
          method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
          await this.loadServices();
          this.adminManager.showSuccessMessage('Service deactivated successfully');
        } else {
          alert(data.error || 'Deactivation failed');
        }
      } catch (error) {
        console.error('Deactivate service error:', error);
        alert('Request failed');
      }
    }
  }

  async activateService(serviceId) {
    const msg = (window.t && window.t('confirm_activate_service')) || 'Are you sure you want to activate this service?';
    if (confirm(msg)) {
      try {
        // Get current service data
        const response = await fetch(`/api/admin/services`);
        const services = await response.json();
        const service = services.find(s => s.id == serviceId);
        
        if (!service) {
          alert('Service not found');
          return;
        }
        
        // Prepare data with current values, only changing is_active to true
        const updateData = {
          name_en: service.name_en,
          name_cn: service.name_cn,
          name_ru: service.name_ru,
          description_en: service.description_en,
          description_cn: service.description_cn,
          description_ru: service.description_ru,
          price: service.price,
          category_en: service.category_en,
          category_cn: service.category_cn,
          category_ru: service.category_ru,
          image_url: service.image_url,
          is_active: true
        };
        
        // Make the PUT request to update the service
        const updateResponse = await fetch(`/api/admin/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });

        const data = await updateResponse.json();
        
        if (data.success) {
          await this.loadServices();
          this.adminManager.showSuccessMessage('Service activated successfully');
        } else {
          alert(data.error || 'Activation failed');
        }
      } catch (error) {
        console.error('Activate service error:', error);
        alert('Request failed');
      }
    }
  }

  async deleteServicePermanently(serviceId) {
    const msg = (window.t && window.t('confirm_delete_service')) || 'Permanently delete this service? This cannot be undone. If the service has related active bookings, deletion will be blocked.';
    if (!confirm(msg)) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}/permanent`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        await this.loadServices();
        this.adminManager.showSuccessMessage('Service deleted permanently');
      } else {
        // Show specific error message from server
        alert(data.error || 'Deletion failed');
      }
    } catch (error) {
      console.error('Permanent delete service error:', error);
      alert('Request failed');
    }
  }

  async handleServiceSubmit(e) {
    e.preventDefault();
    
    const serviceId = document.getElementById('service-id').value;
    const formData = {
      name_en: document.getElementById('service-name-en').value,
      name_cn: document.getElementById('service-name-cn').value,
      name_ru: document.getElementById('service-name-ru').value,
      description_en: document.getElementById('service-description-en').value,
      description_cn: document.getElementById('service-description-cn').value,
      description_ru: document.getElementById('service-description-ru').value,
      price: document.getElementById('service-price').value,
      category_en: document.getElementById('service-category-en').value,
      category_cn: document.getElementById('service-category-cn').value,
      category_ru: document.getElementById('service-category-ru').value,
      image_url: document.getElementById('service-image-url').value,
      is_active: document.getElementById('service-status').value === 'true'
    };

    try {
      let response, data;
      if (serviceId) {
        response = await fetch(`/api/admin/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      data = await response.json();

      if (data.success) {
        document.getElementById('service-modal').style.display = 'none';
        await this.loadServices();
        this.adminManager.showSuccessMessage(serviceId ? 'Service updated successfully' : 'Service created successfully');
      } else {
        alert(data.error || 'Save failed');
      }
    } catch (error) {
      console.error('Service save error:', error);
      alert('Request failed');
    }
  }
}

// Make ServicesManager available globally for browser use
if (typeof window !== 'undefined') {
  window.ServicesManager = ServicesManager;
}

// Export for other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ServicesManager };
}