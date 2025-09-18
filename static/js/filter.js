document.addEventListener('DOMContentLoaded', function () {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const propertyCards = document.querySelectorAll('.property-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Manage active button state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const statusToFilter = this.getAttribute('data-status');

      propertyCards.forEach(card => {
        const cardStatus = card.querySelector('.status-badge').textContent.trim();
        
        if (statusToFilter === 'all' || cardStatus === statusToFilter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
