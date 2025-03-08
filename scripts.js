// Sélection des éléments DOM
const addNewTaskBtn = document.querySelector('#addTask');
const addNewTaskModal = document.querySelector('#taskModal');
const closeModalBtn = document.querySelector('#closeModal');
const cancelAddTaskBtn = document.querySelector('#cancelAddTask');
const editTaskModal = document.querySelector('#editTaskModal');
const closeEditModalBtn = document.querySelector('#closeEditModal');
const cancelEditTaskBtn = document.querySelector('#cancelEditTask');
const taskDetailsModal = document.querySelector('#taskDetailsModal');
const closeDetailsModalBtn = document.querySelector('#closeDetailsModal');
const closeDetailsBtn = document.querySelector('#closeDetailsBtn');
const editFromDetailsBtn = document.querySelector('#editFromDetailsBtn');
const confirmDeleteModal = document.querySelector('#confirmDeleteModal');
const closeConfirmModalBtn = document.querySelector('#closeConfirmModal');
const cancelDeleteBtn = document.querySelector('#cancelDeleteBtn');
const confirmDeleteBtn = document.querySelector('#confirmDeleteBtn');
const searchInput = document.querySelector('#searchTask');
const filterSelect = document.querySelector('#filterTasks');
const deleteSelectedBtn = document.querySelector('#deleteSelected');

// Ouvrir le modal d'ajout de tâche
addNewTaskBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addNewTaskModal.classList.add('active');
});

// Fermer le modal d'ajout de tâche
closeModalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addNewTaskModal.classList.remove('active');
});

cancelAddTaskBtn.addEventListener('click', (e) => {
  e.preventDefault();
  addNewTaskModal.classList.remove('active');
});

// Fermer le modal de modification de tâche
closeEditModalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  editTaskModal.classList.remove('active');
});

cancelEditTaskBtn.addEventListener('click', (e) => {
  e.preventDefault();
  editTaskModal.classList.remove('active');
});

// Fermer le modal de détails
closeDetailsModalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  taskDetailsModal.classList.remove('active');
});

closeDetailsBtn.addEventListener('click', (e) => {
  e.preventDefault();
  taskDetailsModal.classList.remove('active');
});

// Fermer le modal de confirmation
closeConfirmModalBtn.addEventListener('click', (e) => {
  e.preventDefault();
  confirmDeleteModal.classList.remove('active');
});

cancelDeleteBtn.addEventListener('click', (e) => {
  e.preventDefault();
  confirmDeleteModal.classList.remove('active');
});

// Fermer les modals en cliquant sur l'overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  });
});

// Objet principal pour gérer les tâches
const TASK = {
  selectedTask: [],
  currentFilter: 0,
  searchTerm: '',
  currentTaskId: null,

  // Initialiser les tâches depuis le localStorage
  initTask: function () {
    const task = localStorage.getItem('tasks');
    if (task) {
      return JSON.parse(task);
    } else {
      localStorage.setItem('tasks', JSON.stringify([]));
      return [];
    }
  },

  // Mettre à jour les compteurs de statistiques
  updateStats: function() {
    const taskList = this.initTask();
    const pendingCount = taskList.filter(task => task.status == 1).length;
    const completedCount = taskList.filter(task => task.status == 3).length;
    const canceledCount = taskList.filter(task => task.status == 2).length;
    const totalCount = taskList.length;

    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('canceledCount').textContent = canceledCount;
    document.getElementById('totalCount').textContent = totalCount;
  },

  // Afficher les tâches selon les filtres
  displayTask: function () {
    let taskList = this.initTask();
    const mainTask = document.querySelector('#main-task__content');
    
    // Appliquer le filtre de statut
    if (this.currentFilter > 0) {
      taskList = taskList.filter(task => task.status == this.currentFilter);
    }
    
    // Appliquer la recherche
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      taskList = taskList.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description.toLowerCase().includes(searchLower)
      );
    }

    mainTask.innerHTML = '';

    if (taskList.length > 0) {
      taskList.forEach((item) => {
        let statusText = '';
        let statusClass = '';
        
        switch (parseInt(item.status)) {
          case 2:
            statusText = 'Annulé';
            statusClass = 'canceled';
            break;
          case 3:
            statusText = 'Terminé';
            statusClass = 'completed';
            break;
          default:
            statusText = 'En cours';
            statusClass = 'pending';
            break;
        }
        
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.innerHTML = `
          <div class="task-header">
            <h3 class="task-title">${item.title}</h3>
            <input type="checkbox" class="task-checkbox" data-id="${item.id}" ${this.selectedTask.includes(parseInt(item.id)) ? 'checked' : ''}>
          </div>
          <p class="task-description">${item.description}</p>
          <div class="task-date">
            <span class="task-date-icon">📅</span> ${this.formatDate(item.date)}
          </div>
          <div class="task-footer">
            <span class="task-status ${statusClass}">${statusText}</span>
            <div class="task-actions">
              <button class="action-btn view" data-id="${item.id}">👁️</button>
              <button class="action-btn edit" data-id="${item.id}">✏️</button>
              <button class="action-btn status" data-id="${item.id}">🔄</button>
            </div>
          </div>
        `;
        
        // Ajouter les écouteurs d'événements pour chaque bouton
        const statusBtn = taskCard.querySelector('.action-btn.status');
        statusBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.changeTaskStatus(e.target.dataset.id);
        });

        const checkboxBtn = taskCard.querySelector('.task-checkbox');
        checkboxBtn.addEventListener('change', (e) => {
          this.toggleTaskSelection(e.target.dataset.id);
        });

        const viewBtn = taskCard.querySelector('.action-btn.view');
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.viewTaskDetails(e.target.dataset.id);
        });
        
        const editBtn = taskCard.querySelector('.action-btn.edit');
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openEditTaskModal(e.target.dataset.id);
        });
        
        mainTask.appendChild(taskCard);
      });
    } else {
      mainTask.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3 class="empty-state-title">Aucune tâche disponible</h3>
          <p class="empty-state-text">Commencez par ajouter une nouvelle tâche en cliquant sur le bouton "Nouvelle tâche".</p>
          <button class="btn btn-primary" id="addTaskEmpty">
            <span class="btn-icon">+</span> Nouvelle tâche
          </button>
        </div>
      `;
      
      const addTaskEmptyBtn = document.querySelector('#addTaskEmpty');
      if (addTaskEmptyBtn) {
        addTaskEmptyBtn.addEventListener('click', () => {
          addNewTaskModal.classList.add('active');
        });
      }
    }
    
    // Mettre à jour les statistiques
    this.updateStats();
    
    // Mettre à jour l'apparence du bouton de suppression
    this.updateSelectedTaskBtn();
  },

  // Formater la date pour l'affichage
  formatDate: function(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  },

  // Configurer le formulaire d'ajout de tâche
  setupAddTaskForm: function() {
    const addTaskForm = document.querySelector('#addTaskForm');
    
    // Supprimer les anciens écouteurs en clonant et remplaçant le formulaire
    const newForm = addTaskForm.cloneNode(true);
    addTaskForm.parentNode.replaceChild(newForm, addTaskForm);
    
    // Ajouter le nouvel écouteur
    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const taskList = this.initTask();
      const taskTitle = document.getElementById('taskTitle').value;
      const taskDescription = document.getElementById('taskDescription').value;
      const taskDate = document.getElementById('taskDate').value;
      
      // Générer un ID unique
      const newId = taskList.length > 0 ? Math.max(...taskList.map(task => task.id)) + 1 : 1;
      
      const task = {
        id: newId,
        title: taskTitle,
        description: taskDescription,
        date: taskDate,
        status: 1
      };
      
      taskList.push(task);
      localStorage.setItem('tasks', JSON.stringify(taskList));
      
      newForm.reset();
      addNewTaskModal.classList.remove('active');
      this.displayTask();
    });
  },

  // Changer le statut d'une tâche
  changeTaskStatus: function(taskId) {
    if (!taskId) return;
    
    const taskList = this.initTask();
    const task = taskList.find(item => item.id == taskId);
    
    if (!task) return;

    // Cycle entre les statuts: En cours -> Annulé -> Terminé -> En cours
    switch (parseInt(task.status)) {
      case 1:
        task.status = 2;
        break;
      case 2:
        task.status = 3;
        break;
      case 3:
        task.status = 1;
        break;
    }

    localStorage.setItem('tasks', JSON.stringify(taskList));
    this.displayTask();
    
    // Mettre à jour le modal de détails s'il est ouvert
    if (taskDetailsModal.classList.contains('active') && this.currentTaskId == taskId) {
      this.viewTaskDetails(taskId);
    }
  },

  // Sélectionner/désélectionner une tâche pour suppression
  toggleTaskSelection: function(taskId) {
    if (!taskId) return;
    
    const numericId = parseInt(taskId);
    const index = this.selectedTask.indexOf(numericId);
    
    if (index === -1) {
      this.selectedTask.push(numericId);
    } else {
      this.selectedTask.splice(index, 1);
    }
    
    this.updateSelectedTaskBtn();
  },

  // Mettre à jour l'apparence du bouton de suppression
  updateSelectedTaskBtn: function() {
    if (this.selectedTask.length > 0) {
      deleteSelectedBtn.classList.add('active');
      deleteSelectedBtn.innerHTML = `<span class="btn-icon">🗑️</span> Supprimer (${this.selectedTask.length})`;
    } else {
      deleteSelectedBtn.classList.remove('active');
      deleteSelectedBtn.innerHTML = `<span class="btn-icon">🗑️</span> Supprimer`;
    }
  },

  // Afficher les détails d'une tâche
  viewTaskDetails: function(taskId) {
    if (!taskId) return;
    
    const taskList = this.initTask();
    const task = taskList.find(item => item.id == taskId);
    
    if (!task) return;

    this.currentTaskId = taskId;

    let statusText = '';
    let statusClass = '';
    
    switch (parseInt(task.status)) {
      case 2:
        statusText = 'Annulé';
        statusClass = 'canceled';
        break;
      case 3:
        statusText = 'Terminé';
        statusClass = 'completed';
        break;
      default:
        statusText = 'En cours';
        statusClass = 'pending';
        break;
    }

    // Mettre à jour le contenu du modal
    document.getElementById('detailsTaskTitle').textContent = task.title;
    
    const taskDetailsContent = document.getElementById('taskDetailsContent');
    taskDetailsContent.innerHTML = `
      <div class="task-details">
        <div class="task-details-header">
          <h3 class="task-details-title">${task.title}</h3>
          <div class="task-details-date">
            <span>📅</span> ${this.formatDate(task.date)}
          </div>
        </div>
        <div class="task-details-description">
          ${task.description}
        </div>
        <div>
          <span class="task-details-status ${statusClass}">${statusText}</span>
        </div>
      </div>
    `;
    
    // Configurer le bouton d'édition
    editFromDetailsBtn.dataset.id = task.id;
    editFromDetailsBtn.addEventListener('click', () => {
      this.openEditTaskModal(task.id);
      taskDetailsModal.classList.remove('active');
    }, { once: true });
    
    // Afficher le modal
    taskDetailsModal.classList.add('active');
  },

  // Ouvrir le modal de modification d'une tâche
  openEditTaskModal: function(taskId) {
    if (!taskId) return;
    
    const taskList = this.initTask();
    const task = taskList.find(item => item.id == taskId);
    
    if (!task) return;
    
    // Remplir le formulaire avec les données de la tâche
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskDate').value = task.date;
    document.getElementById('editTaskStatus').value = task.status;
    
    // Afficher le modal
    editTaskModal.classList.add('active');
    
    // Configurer le formulaire d'édition
    this.setupEditTaskForm();
  },

  // Configurer le formulaire d'édition
  setupEditTaskForm: function() {
    const editForm = document.getElementById('editTaskForm');
    
    // Supprimer l'ancien écouteur s'il existe pour éviter les doublons
    const newEditForm = editForm.cloneNode(true);
    editForm.parentNode.replaceChild(newEditForm, editForm);
    
    newEditForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateTask();
    });
  },

  // Mettre à jour une tâche
  updateTask: function() {
    const taskId = document.getElementById('editTaskId').value;
    const taskList = this.initTask();
    const taskIndex = taskList.findIndex(item => item.id == taskId);
    
    if (taskIndex === -1) return;
    
    // Mettre à jour les données de la tâche
    taskList[taskIndex] = {
      id: parseInt(taskId),
      title: document.getElementById('editTaskTitle').value,
      description: document.getElementById('editTaskDescription').value,
      date: document.getElementById('editTaskDate').value,
      status: parseInt(document.getElementById('editTaskStatus').value)
    };
    
    // Sauvegarder et rafraîchir l'affichage
    localStorage.setItem('tasks', JSON.stringify(taskList));
    editTaskModal.classList.remove('active');
    this.displayTask();
  },

  // Ouvrir le modal de confirmation de suppression
  openDeleteConfirmation: function() {
    if (this.selectedTask.length === 0) return;
    
    confirmDeleteModal.classList.add('active');
    
    // Configurer le bouton de confirmation
    confirmDeleteBtn.addEventListener('click', () => {
      this.deleteTask();
      confirmDeleteModal.classList.remove('active');
    }, { once: true });
  },

  // Supprimer les tâches sélectionnées
  deleteTask: function() {
    if (this.selectedTask.length === 0) return;
    
    const taskList = this.initTask();
    const newTaskList = taskList.filter(task => !this.selectedTask.includes(task.id));
    
    localStorage.setItem('tasks', JSON.stringify(newTaskList));
    this.selectedTask = [];
    this.updateSelectedTaskBtn();
    this.displayTask();
  }
};

// Initialiser l'application
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les tâches
  TASK.initTask();
  TASK.displayTask();
  
  // Configurer le formulaire d'ajout
  TASK.setupAddTaskForm();
  
  // Écouteur pour le bouton de suppression
  deleteSelectedBtn.addEventListener('click', (e) => {
    e.preventDefault();
    TASK.openDeleteConfirmation();
  });
  
  // Écouteur pour la recherche
  searchInput.addEventListener('input', function() {
    TASK.searchTerm = this.value.trim();
    TASK.displayTask();
  });
  
  // Écouteur pour le filtre
  filterSelect.addEventListener('change', function() {
    TASK.currentFilter = parseInt(this.value);
    TASK.displayTask();
  });
});