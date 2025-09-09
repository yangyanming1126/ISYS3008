// ====================================
// Homepage Featured Services Loader
// Sleepy Tiger Farmhouse
// ====================================

// Load featured services for homepage
function loadFeaturedServices() {
  // Get current language preference
  const currentLang = (window.languageManager && window.languageManager.currentLanguage) || 'en';
  
  fetch(`/api/services?lang=${currentLang}`)
    .then(res => res.json())
    .then(data => {
      const featured = data.slice(0, 2); // Show top 2 services like in the original
      const container = document.getElementById('featured-service-list');
      
      if (!container) return;
      
      if (featured.length === 0) {
        container.innerHTML = '<p>No featured services available.</p>';
        return;
      }
      
      container.innerHTML = '';

      featured.forEach(service => {
        const div = document.createElement('div');
        div.className = 'service-card';
        
        // Use localized content if available
        const serviceName = service.localized_name || service.name;
        const serviceDescription = service.localized_description || service.description;
        
        div.innerHTML = `
          <h3>${serviceName}</h3>
          <p>${serviceDescription}</p>
          <p><strong>$${service.price}</strong></p>
        `;
        container.appendChild(div);
      });
      
      // Update translate attributes after DOM is updated
      if (window.languageManager) {
        window.languageManager.translatePage();
      }
    })
    .catch(err => {
      console.error('Failed to load featured services:', err);
      const container = document.getElementById('featured-service-list');
      if (container) {
        container.textContent = window.t ? window.t('error_message') : 'Could not load services.';
      }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedServices();
});

// Reload when language changes
document.addEventListener('languageChanged', () => {
  loadFeaturedServices();
});

// Export for global access
window.loadFeaturedServices = loadFeaturedServices;