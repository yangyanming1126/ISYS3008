// 加载服务并展示前两个作为精选
fetch('/api/services')
  .then(res => res.json())
  .then(data => {
    const featured = data.slice(0, 2);
    const container = document.getElementById('featured-service-list');
    container.innerHTML = '';

    featured.forEach(service => {
      const div = document.createElement('div');
      div.className = 'service-card';
      div.innerHTML = `
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <p><strong>$${service.price}</strong></p>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error('Failed to load featured services:', err);
    document.getElementById('featured-service-list').textContent = 'Could not load services.';
  });
