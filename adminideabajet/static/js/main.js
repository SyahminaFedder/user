// Global variables for URLs
const urls = {
  edit: {
    aset: "/admin_ideabajet/edit_aset/",
    lokasi: "/admin_ideabajet/edit_lokasi/",
    e1: "/admin_ideabajet/edit_e1/",
    e2: "/admin_ideabajet/edit_e2/",
    e3: "/admin_ideabajet/edit_e3/",
    e4: "/admin_ideabajet/edit_e4/",
    e5: "/admin_ideabajet/edit_e5/",
    e6: "/admin_ideabajet/edit_e6/",
    e7: "/admin_ideabajet/edit_e7/",
    e8: "/admin_ideabajet/edit_e8/"
  },
  delete: {
    aset: "/admin_ideabajet/delete_aset/",
    lokasi: "/admin_ideabajet/delete_lokasi/",
    e1: "/admin_ideabajet/delete_e1/",
    e2: "/admin_ideabajet/delete_e2/",
    e3: "/admin_ideabajet/delete_e3/",
    e4: "/admin_ideabajet/delete_e4/",
    e5: "/admin_ideabajet/delete_e5/",
    e6: "/admin_ideabajet/delete_e6/",
    e7: "/admin_ideabajet/delete_e7/",
    e8: "/admin_ideabajet/delete_e8/"
  }
};

// Display message for 3 seconds
setTimeout(function() {
  var msg = document.getElementById('message-box');
  if (msg) {
    msg.style.display = 'none';
  }
}, 3000);

// Show specific section and update navigation
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected section
  const selectedSection = document.getElementById(sectionName);
  if (selectedSection) {
    selectedSection.classList.add('active');
  }
  
  // Update navigation active state
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  // Store the current section in sessionStorage
  sessionStorage.setItem('currentSection', sectionName);
  
  // Update page title based on section
  updatePageTitle(sectionName);
  
  // Initialize charts if dashboard is shown
  if (sectionName === 'dashboard') {
    setTimeout(() => {
      initializeCharts();
    }, 100);
  }
}

// Update page title based on current section
function updatePageTitle(sectionName) {
  const titles = {
    'dashboard': 'Admin Dashboard',
    'aset': 'Aset Management',
    'lokasi': 'Lokasi Management',
    'e1': 'Elemen 1: Ipoh Bandar Terbersih',
    'e2': 'Elemen 2: Kemudahan Awam dan Taman',
    'e3': 'Elemen 3: Kemudahan Infrastruktur',
    'e4': 'Elemen 4: Bangunan dan Hartanah Majlis',
    'e5': 'Elemen 5: Harta Modal (Aset)',
    'e6': 'Elemen 6: Ipoh Bandar (Bandar Pintar)',
    'e7': 'Elemen 7: Ipoh Bandar (Bandar Rendah Karbon)',
    'e8': 'Elemen 8: Pembangunan Ekonomi Masyarakat dan Pelancongan'
  };
  
  const title = titles[sectionName] || 'Idea Bajet - Admin';
  document.title = title;
}

// Show create form for specific section
function showForm(sectionName) {
  const formId = `createForm-${sectionName}`;
  const form = document.getElementById(formId);
  if (form) {
    form.style.display = 'block';
    
    // Remove existing event listeners to prevent duplicates
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Add validation to create form
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      validateAndSubmitCreateForm(this, sectionName);
    });
  }
}

// Show confirmation delete modal
function showDeleteConfirmation(sectionName, id, itemName) {
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'delete-modal-overlay';
  modalOverlay.id = 'deleteModalOverlay';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'delete-modal-content';
  
  modalContent.innerHTML = `
    <div class="delete-modal-header">
      <h3>Confirm Delete</h3>
      <button class="modal-close-btn" onclick="closeDeleteModal()">&times;</button>
    </div>
    <div class="delete-modal-body">
      <div class="delete-icon">🗑️</div>
      <p>Are you sure you want to delete <strong>"${itemName}"</strong>?</p>
      <p class="delete-warning">This action cannot be undone.</p>
    </div>
    <div class="delete-modal-footer">
      <button class="btn-cancel" onclick="closeDeleteModal()">Cancel</button>
      <button class="btn-delete" onclick="confirmDelete('${sectionName}', ${id})">Delete</button>
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // Add fade-in animation
  setTimeout(() => {
    modalOverlay.classList.add('show');
  }, 10);
}

// Close delete confirmation modal
function closeDeleteModal() {
  const modalOverlay = document.getElementById('deleteModalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('show');
    setTimeout(() => {
      modalOverlay.remove();
    }, 300);
  }
}

// Confirm delete action
function confirmDelete(sectionName, id) {
  const deleteUrl = urls.delete[sectionName] + id + '/';
  
  // Create and submit form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = deleteUrl;
  
  // Add CSRF token
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrfmiddlewaretoken';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);
  
  // Add section input
  const sectionInput = document.createElement('input');
  sectionInput.type = 'hidden';
  sectionInput.name = 'section';
  sectionInput.value = sectionName;
  form.appendChild(sectionInput);
  
  document.body.appendChild(form);
  form.submit();
}

// Edit row function with improved design
function editRow(sectionName, id, value) {
  const editUrl = urls.edit[sectionName] + id + '/';
  const cellId = `${sectionName}-${id}`;
  const actionId = `action-${sectionName}-${id}`;
  
  // Define the correct field names for each section
  const fieldNames = {
    'aset': 'aset',
    'lokasi': 'list_lokasi',
    'e1': 'e1',
    'e2': 'e2',
    'e3': 'e3',
    'e4': 'e4',
    'e5': 'e5',
    'e6': 'e6',
    'e7': 'e7',
    'e8': 'e8'
  };
  
  const fieldName = fieldNames[sectionName] || sectionName;
  
  // Special handling for aset section to include elemen5 dropdown
  if (sectionName === 'aset') {
    // Get the current elemen5 value for this aset
    const currentElemen5Cell = document.querySelector(`#row-aset-${id} td:nth-child(2)`);
    const currentElemen5Text = currentElemen5Cell ? currentElemen5Cell.textContent.trim() : '';
    
    // Create dropdown options from the existing elemen5 data
    let dropdownOptions = '<option value="">Pilih Elemen 5</option>';
    const elemen5Options = document.querySelectorAll('select[name="elemen5_id"] option');
    elemen5Options.forEach(option => {
      if (option.value !== '') { // Skip the placeholder option
        const selected = option.textContent.trim() === currentElemen5Text ? 'selected' : '';
        dropdownOptions += `<option value="${option.value}" ${selected}>${option.textContent}</option>`;
      }
    });
    
    // Update the aset cell (1st column) with the text input
    document.getElementById(cellId).innerHTML = `
      <div class="edit-input-container">
        <input type="text" name="${fieldName}" value="${value}" required class="edit-input" form="editForm-${sectionName}-${id}">
      </div>
    `;
    
    // Update the elemen5 cell (2nd column) with the dropdown
    const elemen5Cell = document.querySelector(`#row-aset-${id} td:nth-child(2)`);
    if (elemen5Cell) {
      elemen5Cell.innerHTML = `
        <div class="edit-input-container">
          <select name="elemen5_id" class="edit-select" form="editForm-${sectionName}-${id}">
            ${dropdownOptions}
          </select>
        </div>
      `;
    }
    
    // Add the form element to the page (hidden)
    const formElement = document.createElement('div');
    formElement.style.display = 'none';
    formElement.innerHTML = `
      <form id="editForm-${sectionName}-${id}" method="post" action="${editUrl}">
        <input type="hidden" name="csrfmiddlewaretoken" value="${document.querySelector('[name=csrfmiddlewaretoken]').value}">
        <input type="hidden" name="section" value="${sectionName}">
      </form>
    `;
    document.body.appendChild(formElement);
    
    // Add form submission event listener for validation
    const form = document.getElementById(`editForm-${sectionName}-${id}`);
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        validateAndSubmitForm(this, sectionName, id);
      });
    }
    
  } else {
    document.getElementById(cellId).innerHTML = `
      <div class="edit-input-container">
        <input type="text" name="${fieldName}" value="${value}" required class="edit-input" form="editForm-${sectionName}-${id}">
      </div>
    `;
  }
  
  document.getElementById(actionId).innerHTML = `
    <div class="edit-actions">
      <button type="submit" form="editForm-${sectionName}-${id}" class="btn-save">
        <span class="btn-icon">✓</span>
        Save
      </button>
      <button type="button" class="btn-cancel-edit" onclick="cancelEdit('${sectionName}', ${id}, '${value.replace(/'/g, "\\'")}')">
        <span class="btn-icon">✕</span>
        Cancel
      </button>
    </div>
        `;
    
    // Add the form element to the page (hidden) for non-aset sections
    if (sectionName !== 'aset') {
      const formElement = document.createElement('div');
      formElement.style.display = 'none';
      formElement.innerHTML = `
        <form id="editForm-${sectionName}-${id}" method="post" action="${editUrl}">
          <input type="hidden" name="csrfmiddlewaretoken" value="${document.querySelector('[name=csrfmiddlewaretoken]').value}">
          <input type="hidden" name="section" value="${sectionName}">
        </form>
      `;
      document.body.appendChild(formElement);
      
      // Add form submission event listener for validation
      const form = document.getElementById(`editForm-${sectionName}-${id}`);
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          validateAndSubmitForm(this, sectionName, id);
        });
      }
    }
  
  // Focus on the input field
  setTimeout(() => {
    const input = document.querySelector(`#${cellId} input`);
    if (input) {
      input.focus();
      input.select();
    }
  }, 100);
}

// Show validation message
function showValidationMessage(message, type = 'error') {
  // Remove any existing validation message
  const existingMessage = document.querySelector('.validation-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create validation message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `validation-message validation-${type}`;
  messageDiv.innerHTML = `
    <div class="validation-content">
      <span class="validation-icon">${type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span class="validation-text">${message}</span>
      <button class="validation-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(messageDiv);
  
  // Show with animation
  setTimeout(() => {
    messageDiv.classList.add('show');
  }, 10);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.classList.remove('show');
      setTimeout(() => {
        if (messageDiv.parentElement) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 5000);
}

// Validate and submit form
function validateAndSubmitForm(form, sectionName, id) {
  const inputs = form.querySelectorAll('input[type="text"], select');
  let isValid = true;
  let emptyFields = [];
  
  inputs.forEach(input => {
    if (input.hasAttribute('required') && (!input.value || input.value.trim() === '')) {
      isValid = false;
      emptyFields.push(input.name || 'field');
      input.style.borderColor = '#e74c3c';
      input.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
    } else {
      input.style.borderColor = '#3498db';
      input.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.2)';
    }
  });
  
  if (!isValid) {
    const fieldNames = {
      'aset': 'Aset name',
      'list_lokasi': 'Lokasi name',
      'e1': 'Elemen 1 name',
      'e2': 'Elemen 2 name',
      'e3': 'Elemen 3 name',
      'e4': 'Elemen 4 name',
      'e5': 'Elemen 5 name',
      'e6': 'Elemen 6 name',
      'e7': 'Elemen 7 name',
      'e8': 'Elemen 8 name',
      'elemen5_id': 'Elemen 5 selection'
    };
    
    const missingFields = emptyFields.map(field => fieldNames[field] || field).join(', ');
    showValidationMessage(`Please fill in the required fields: ${missingFields}`);
    return false;
  }
  
  // If valid, submit the form
  form.submit();
  return true;
}

// Validate and submit create form
function validateAndSubmitCreateForm(form, sectionName) {
  const inputs = form.querySelectorAll('input[type="text"], select');
  let isValid = true;
  let emptyFields = [];
  
  inputs.forEach(input => {
    if (input.hasAttribute('required') && (!input.value || input.value.trim() === '')) {
      isValid = false;
      emptyFields.push(input.name || 'field');
      input.style.borderColor = '#e74c3c';
      input.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.2)';
    } else {
      input.style.borderColor = '#3498db';
      input.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.2)';
    }
  });
  
  if (!isValid) {
    const fieldNames = {
      'aset': 'Aset name',
      'list_lokasi': 'Lokasi name',
      'e1': 'Elemen 1 name',
      'e2': 'Elemen 2 name',
      'e3': 'Elemen 3 name',
      'e4': 'Elemen 4 name',
      'e5': 'Elemen 5 name',
      'e6': 'Elemen 6 name',
      'e7': 'Elemen 7 name',
      'e8': 'Elemen 8 name',
      'elemen5_id': 'Elemen 5 selection'
    };
    
    const missingFields = emptyFields.map(field => fieldNames[field] || field).join(', ');
    showValidationMessage(`Please fill in the required fields: ${missingFields}`);
    return false;
  }
  
  // If valid, submit the form
  form.submit();
  return true;
}

// Cancel edit function
function cancelEdit(sectionName, id, value) {
  const cellId = `${sectionName}-${id}`;
  const actionId = `action-${sectionName}-${id}`;
  
  if (sectionName === 'aset') {
    // For aset, we need to restore both the aset name and elemen5
    const currentElemen5Cell = document.querySelector(`#row-aset-${id} td:nth-child(2)`);
    const currentElemen5Text = currentElemen5Cell ? currentElemen5Cell.textContent.trim() : '-';
    
    // Restore the aset cell
    document.getElementById(cellId).textContent = value;
    
    // Restore the elemen5 cell
    const elemen5Cell = document.querySelector(`#row-aset-${id} td:nth-child(2)`);
    if (elemen5Cell) {
      elemen5Cell.textContent = currentElemen5Text;
    }
    
    // Remove the hidden form element
    const hiddenForm = document.getElementById(`editForm-${sectionName}-${id}`);
    if (hiddenForm) {
      hiddenForm.remove();
    }
  } else {
    document.getElementById(cellId).textContent = value;
  }
  
  // Remove the hidden form element
  const hiddenForm = document.getElementById(`editForm-${sectionName}-${id}`);
  if (hiddenForm) {
    hiddenForm.remove();
  }
  
  document.getElementById(actionId).innerHTML = `
    <button class="btn-create" onclick="editRow('${sectionName}', ${id}, '${value.replace(/'/g, "\\'")}')">Edit</button>
    <button class="btn-create" style="background:#e74c3c;" onclick="showDeleteConfirmation('${sectionName}', ${id}, '${value.replace(/'/g, "\\'")}')">Delete</button>
  `;
}

// Initialize charts
function initializeCharts() {
  // Visitor Chart (Pie Chart)
  const visitorCtx = document.getElementById('visitorChart');
  if (visitorCtx) {
    new Chart(visitorCtx, {
      type: 'doughnut',
      data: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#3498db', '#e74c3c', '#f39c12'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Revenue Chart (Line Chart)
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Element Chart (Bar Chart)
  const elementCtx = document.getElementById('elementChart');
  if (elementCtx) {
    new Chart(elementCtx, {
      type: 'bar',
      data: {
        labels: ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
        datasets: [{
          label: 'Elements',
          data: [12, 19, 3, 5, 2, 3, 8, 15],
          backgroundColor: [
            '#3498db', '#e74c3c', '#f39c12', '#9b59b6',
            '#1abc9c', '#34495e', '#e67e22', '#95a5a6'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Trend Chart (Area Chart)
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Trends',
          data: [4, 8, 15, 16],
          borderColor: '#9b59b6',
          backgroundColor: 'rgba(155, 89, 182, 0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Initialize with dashboard or restore previous section
document.addEventListener('DOMContentLoaded', function() {
  // Check if there's a section parameter in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlSection = urlParams.get('section');
  
  if (urlSection) {
    showSection(urlSection);
  } else {
    // Fallback to sessionStorage or dashboard
    const savedSection = sessionStorage.getItem('currentSection');
    if (savedSection) {
      showSection(savedSection);
    } else {
      showSection('dashboard');
    }
  }
  
  // Initialize charts when dashboard is shown
  if (document.getElementById('dashboard').classList.contains('active')) {
    initializeCharts();
  }
  
  // Close modal when clicking outside
  document.addEventListener('click', function(event) {
    const modalOverlay = document.getElementById('deleteModalOverlay');
    if (modalOverlay && event.target === modalOverlay) {
      closeDeleteModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeDeleteModal();
    }
  });
}); 