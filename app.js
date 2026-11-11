const STORAGE_KEY = "life-dashboard-v1";

const AREA_CONFIG = {
  finance: { label: "💰 Finance", short: "finance" },
  business: { label: "💼 Business", short: "business" },
  home: { label: "🏠 Home", short: "home" },
  personal: { label: "🌱 Personal", short: "personal" },
  travel: { label: "✈️ Travel", short: "travel" }
};

const defaultState = {
  energy: 5,
  goals: [
    {
      id: crypto.randomUUID(),
      name: "Build an emergency fund",
      area: "finance",
      description: "Create a calm financial buffer with 3 months of expenses stored.",
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: "Plan a spiritual reset",
      area: "personal",
      description: "Create more space for rest, prayer, and self-renewal.",
      createdAt: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "Monthly savings sprint",
      goalId: null,
      createdAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      name: "Review bank balances",
      goalId: null,
      minutes: 20,
      done: false,
      createdAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: "Take a 10-minute walk",
      goalId: null,
      minutes: 10,
      done: false,
      createdAt: new Date().toISOString()
    }
  ],
  plannerEvents: [],
  activityLog: []
};

let state = loadState();

const els = {
  date: document.getElementById("date"),
  liveClock: document.getElementById("liveClock"),
  energyValue: document.getElementById("energyValue"),
  energyButtons: document.getElementById("energyButtons"),
  goalStat: document.getElementById("goalStat"),
  taskStat: document.getElementById("taskStat"),
  completeStat: document.getElementById("completeStat"),
  progressStat: document.getElementById("progressStat"),
  recommendationText: document.getElementById("recommendationText"),
  areasList: document.getElementById("areasList"),
  goalList: document.getElementById("goalList"),
  allGoals: document.getElementById("allGoals"),
  taskList: document.getElementById("taskList"),
  projectList: document.getElementById("projectList"),
  plannerDate: document.getElementById("plannerDate"),
  plannerSummary: document.getElementById("plannerSummary"),
  scheduleList: document.getElementById("scheduleList"),
  historyGrid: document.getElementById("historyGrid"),
  historyTasks: document.getElementById("historyTasks"),
  historyCompleted: document.getElementById("historyCompleted"),
  historyTime: document.getElementById("historyTime"),
  bestEnergy: document.getElementById("bestEnergy"),
  completionRate: document.getElementById("completionRate"),
  averageTask: document.getElementById("averageTask"),
  predictionText: document.getElementById("predictionText"),
  backupFile: document.getElementById("backupFile"),
  goalModal: document.getElementById("goalModal"),
  projectModal: document.getElementById("projectModal"),
  taskModal: document.getElementById("taskModal"),
  scheduleModal: document.getElementById("scheduleModal"),
  goalName: document.getElementById("goalName"),
  goalArea: document.getElementById("goalArea"),
  goalDescription: document.getElementById("goalDescription"),
  projectName: document.getElementById("projectName"),
  projectGoal: document.getElementById("projectGoal"),
  taskName: document.getElementById("taskName"),
  taskGoal: document.getElementById("taskGoal"),
  taskTime: document.getElementById("taskTime"),
  scheduleTitle: document.getElementById("scheduleTitle"),
  scheduleDate: document.getElementById("scheduleDate"),
  scheduleTime: document.getElementById("scheduleTime"),
  scheduleNotes: document.getElementById("scheduleNotes")
};

init();

function init() {
  bindEvents();
  updateDate();
  updateClock();
  setInterval(updateClock, 1000);

  if (!els.plannerDate.value) {
    els.plannerDate.value = new Date().toISOString().slice(0, 10);
  }

  renderAll();
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  document.getElementById("exportBackupBtn").addEventListener("click", exportBackup);
  document.getElementById("restoreBackupBtn").addEventListener("click", () => els.backupFile.click());
  els.backupFile.addEventListener("change", importBackup);

  document.getElementById("addGoalBtn").addEventListener("click", () => openModal("goalModal"));
  document.getElementById("addGoalFromAreasBtn").addEventListener("click", () => openModal("goalModal"));
  document.getElementById("addProjectBtn").addEventListener("click", () => openModal("projectModal"));
  document.getElementById("addTaskBtn").addEventListener("click", () => openModal("taskModal"));
  document.getElementById("addEventBtn").addEventListener("click", () => openModal("scheduleModal"));

  document.getElementById("submitGoalBtn").addEventListener("click", addGoal);
  document.getElementById("submitProjectBtn").addEventListener("click", addProject);
  document.getElementById("submitTaskBtn").addEventListener("click", addTask);
  document.getElementById("submitScheduleBtn").addEventListener("click", addScheduleEvent);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllModals();
  });

  els.plannerDate.addEventListener("change", renderPlanner);
}

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.id === pageName);
  });

  document.querySelectorAll(".nav").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  const firstInput = modal.querySelector("input, select, textarea, button");
  if (firstInput) firstInput.focus();
}

function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  });
}

function updateDate() {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(now);

  els.date.textContent = formatted;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-GB", {
    hour12: false,
    hourCycle: "h23"
  });

  els.liveClock.textContent = time;
}

function renderAll() {
  renderEnergyButtons();
  renderStats();
  renderRecommendation();
  renderLifeAreas();
  renderGoals();
  renderProjects();
  renderTasks();
  renderPlanner();
  renderHistory();
  renderInsights();
  populateGoalSelectors();
}

function renderEnergyButtons() {
  const current = Number(state.energy) || 5;
  els.energyValue.textContent = current;
  els.energyButtons.innerHTML = "";

  for (let i = 1; i <= 10; i += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `energy-btn${i === current ? " selected" : ""}`;
    btn.textContent = i;
    btn.setAttribute("aria-label", `Set energy to ${i} out of 10`);
    btn.addEventListener("click", () => {
      state.energy = i;
      saveState();
      renderEnergyButtons();
      renderStats();
      renderRecommendation();
      renderInsights();
    });

    els.energyButtons.appendChild(btn);
  }
}

function renderStats() {
  const totalGoals = state.goals.length;
  const totalTasks = state.tasks.length;
  const completed = state.tasks.filter((task) => task.done).length;
  const progress = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;

  els.goalStat.textContent = totalGoals;
  els.taskStat.textContent = totalTasks;
  els.completeStat.textContent = completed;
  els.progressStat.textContent = `${progress}%`;
}

function renderRecommendation() {
  const totalTasks = state.tasks.length;
  const completed = state.tasks.filter((task) => task.done).length;
  const completionRate = totalTasks ? (completed / totalTasks) * 100 : 0;

  let msg = "Keep momentum visible and simple. Choose one important action to finish before noon.";

  if (state.energy >= 8) {
    msg = "You have strong energy right now. Tackle the hardest task before distractions start pulling you away.";
  } else if (state.energy <= 3) {
    msg = "Energy is low today. Protect your attention with a small win, a short walk, and a clearer task list.";
  } else if (completionRate >= 70) {
    msg = "You are moving well. Protect this momentum by finishing one more meaningful action before you stop.";
  } else if (totalTasks === 0) {
    msg = "You have no actions yet. Add a small, specific action that creates forward motion.";
  }

  els.recommendationText.textContent = msg;
}

function renderLifeAreas() {
  const areaEntries = Object.entries(AREA_CONFIG);
  els.areasList.innerHTML = "";

  areaEntries.forEach(([areaKey, areaData]) => {
    const goalList = state.goals.filter((goal) => goal.area === areaKey);
    const taskList = state.tasks.filter((task) => {
      const goal = state.goals.find((item) => item.id === task.goalId);
      return goal && goal.area === areaKey;
    });

    const done = taskList.filter((task) => task.done).length;
    const total = taskList.length || 1;
    const percent = Math.round((done / total) * 100);

    const card = document.createElement("div");
    card.className = `area ${areaKey}`;
    card.innerHTML = `
      <div class="area-name">${areaData.label}</div>
      <div class="bar">
        <div class="bar-fill" style="width:${percent}%"></div>
      </div>
      <div class="area-info">${goalList.length} goals • ${done}/${taskList.length || 0} actions complete</div>
    `;

    els.areasList.appendChild(card);
  });
}

function renderGoals() {
  const cards = state.goals.map((goal) => {
    const tasks = getGoalTasks(goal.id);
    const progress = getGoalProgress(goal.id);
    const projectCount = state.projects.filter((project) => project.goalId === goal.id).length;

    return `
      <article class="goal-card">
        <div class="goal-top">
          <span class="badge">${AREA_CONFIG[goal.area]?.label || "General"}</span>
          <button class="secondary" type="button" data-delete-goal="${goal.id}">Delete</button>
        </div>

        <div class="goal-description" style="margin-top: 12px;">
          <strong>${escapeHtml(goal.name)}</strong>
        </div>

        <p class="goal-description">${escapeHtml(goal.description || "No description added yet.")}</p>

        <div class="progress">
          <div class="progress-bar" style="width:${progress}%"></div>
        </div>

        <div class="goal-foot">
          <span>${tasks.length} action${tasks.length === 1 ? "" : "s"}</span>
          <span>${progress}% complete</span>
        </div>

        <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
          <span class="tag">${projectCount} project${projectCount === 1 ? "" : "s"}</span>
          <span class="tag">${tasks.filter((task) => task.done).length} done</span>
        </div>
      </article>
    `;
  }).join("");

  els.goalList.innerHTML = cards || "<div class='empty'>No goals yet. Add your first goal to start building momentum.</div>";
  els.allGoals.innerHTML = cards || "<div class='empty'>No goals yet. Add your first goal to start building momentum.</div>";

  document.querySelectorAll("[data-delete-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteGoal(button.dataset.deleteGoal);
    });
  });
}

function renderProjects() {
  const projectCards = state.projects.map((project) => {
    const relevantTasks = state.tasks.filter((task) => task.goalId === project.goalId);
    const goalName = state.goals.find((goal) => goal.id === project.goalId)?.name || "General";

    return `
      <article class="project-card">
        <div class="project-top">
          <span class="badge">${escapeHtml(goalName)}</span>
          <button class="secondary" type="button" data-delete-project="${project.id}">Delete</button>
        </div>

        <p class="project-description" style="margin-top: 12px;"><strong>${escapeHtml(project.name)}</strong></p>
        <p class="project-description">${relevantTasks.length} connected action${relevantTasks.length === 1 ? "" : "s"}</p>
      </article>
    `;
  });

  els.projectList.innerHTML = projectCards.length
    ? projectCards.join("")
    : "<div class='empty'>Projects will appear here as you create them.</div>";

  document.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteProject(button.dataset.deleteProject);
    });
  });
}

function renderTasks() {
  if (!state.tasks.length) {
    els.taskList.innerHTML = "<div class='empty'>No actions yet. Add your first step.</div>";
    return;
  }

  const tasksHtml = state.tasks.map((task) => {
    const goalName = state.goals.find((goal) => goal.id === task.goalId)?.name || "General";
    return `
      <div class="task ${task.done ? "done" : ""}" data-task-id="${task.id}">
        <button class="check ${task.done ? "done" : ""}" type="button" data-toggle-task="${task.id}" aria-label="${task.done ? "Mark incomplete" : "Mark complete"}"></button>
        <div>
          <div class="task-name">${escapeHtml(task.name)}</div>
          <div class="meta">
            <span class="fit">${escapeHtml(goalName)}</span>
            <span class="timer">${task.minutes}m</span>
          </div>
        </div>
        <button class="secondary" type="button" data-delete-task="${task.id}">Delete</button>
      </div>
    `;
  }).join("");

  els.taskList.innerHTML = tasksHtml;

  document.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleTask(button.dataset.toggleTask);
    });
  });

  document.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteTask(button.dataset.deleteTask);
    });
  });
}

function renderPlanner() {
  const date = els.plannerDate.value || new Date().toISOString().slice(0, 10);
  const events = state.plannerEvents.filter((event) => event.date === date);

  if (!events.length) {
    els.plannerSummary.textContent = "No events planned for this date yet.";
    els.scheduleList.innerHTML = "<div class='empty'>Your day is waiting to be planned. 🌷</div>";
    return;
  }

  els.plannerSummary.textContent = `${events.length} event${events.length === 1 ? "" : "s"} planned for this date.`;
  els.scheduleList.innerHTML = events.map((event) => `
    <div class="schedule-item">
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <div class="schedule-time">${event.time || "All day"} • ${event.notes || "No notes"}</div>
      </div>
      <div>
        <button class="secondary" type="button" data-delete-event="${event.id}">Delete</button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteEvent(button.dataset.deleteEvent);
    });
  });
}

function renderHistory() {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push(day.toISOString().slice(0, 10));
  }

  const cells = days.map((day) => {
    const count = state.tasks.filter((task) => task.done && task.completedAt && task.completedAt.slice(0, 10) === day).length;
    const hasActivity = count > 0;
    return `
      <div class="day ${hasActivity ? "good" : "active"}" title="${day}">
        ${day.slice(5)}
      </div>
    `;
  }).join("");

  els.historyGrid.innerHTML = cells;

  const totalTasks = state.tasks.length;
  const completed = state.tasks.filter((task) => task.done).length;
  const totalMinutes = state.tasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0);

  els.historyTasks.textContent = totalTasks;
  els.historyCompleted.textContent = completed;
  els.historyTime.textContent = `${totalMinutes}m`;
}

function renderInsights() {
  const totalTasks = state.tasks.length;
  const completed = state.tasks.filter((task) => task.done).length;
  const completionRate = totalTasks ? Math.round((completed / totalTasks) * 100) : 0;
  const averageTime = totalTasks ? Math.round(state.tasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0) / totalTasks) : 0;

  const bestEnergy = state.energy >= 7 ? "8/10" : state.energy >= 5 ? "6/10" : "4/10";

  els.bestEnergy.textContent = bestEnergy;
  els.completionRate.textContent = `${completionRate}%`;
  els.averageTask.textContent = `${averageTime}m`;
  els.predictionText.textContent = completionRate >= 60
    ? "Momentum is building. You are likely to finish the next few actions with a steady rhythm."
    : "Early progress is being made. A focused 20-minute action could create the lift you need for the next step.";
}

function populateGoalSelectors() {
  const goalOptions = state.goals.map((goal) => `<option value="${goal.id}">${escapeHtml(goal.name)}</option>`).join("");
  els.projectGoal.innerHTML = goalOptions || "<option value=''>No goals yet</option>";
  els.taskGoal.innerHTML = goalOptions || "<option value=''>No goals yet</option>";
}

function addGoal() {
  const name = els.goalName.value.trim();
  const description = els.goalDescription.value.trim();
  const area = els.goalArea.value || "finance";

  if (!name) {
    alert("Please enter a goal name.");
    return;
  }

  state.goals.push({
    id: crypto.randomUUID(),
    name,
    area,
    description,
    createdAt: new Date().toISOString()
  });

  saveState();
  renderAll();
  closeAllModals();

  els.goalName.value = "";
  els.goalDescription.value = "";
}

function addProject() {
  const name = els.projectName.value.trim();
  const goalId = els.projectGoal.value;

  if (!name) {
    alert("Please enter a project name.");
    return;
  }

  if (!goalId) {
    alert("Please select a goal before creating a project.");
    return;
  }

  state.projects.push({
    id: crypto.randomUUID(),
    name,
    goalId,
    createdAt: new Date().toISOString()
  });

  saveState();
  renderAll();
  closeAllModals();
  els.projectName.value = "";
}

function addTask() {
  const name = els.taskName.value.trim();
  const goalId = els.taskGoal.value;
  const minutes = Number(els.taskTime.value) || 20;

  if (!name) {
    alert("Please enter an action name.");
    return;
  }

  state.tasks.push({
    id: crypto.randomUUID(),
    name,
    goalId: goalId || null,
    minutes,
    done: false,
    createdAt: new Date().toISOString()
  });

  saveState();
  renderAll();
  closeAllModals();

  els.taskName.value = "";
  els.taskTime.value = 20;
}

function addScheduleEvent() {
  const title = els.scheduleTitle.value.trim();
  const date = els.scheduleDate.value || new Date().toISOString().slice(0, 10);
  const time = els.scheduleTime.value;
  const notes = els.scheduleNotes.value.trim();

  if (!title) {
    alert("Please enter an event title.");
    return;
  }

  state.plannerEvents.push({
    id: crypto.randomUUID(),
    title,
    date,
    time,
    notes
  });

  saveState();
  renderPlanner();
  closeAllModals();

  els.scheduleTitle.value = "";
  els.scheduleDate.value = "";
  els.scheduleTime.value = "";
  els.scheduleNotes.value = "";
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.done = !task.done;
  task.completedAt = task.done ? new Date().toISOString() : null;

  saveState();
  renderAll();
}

function deleteGoal(goalId) {
  state.goals = state.goals.filter((goal) => goal.id !== goalId);
  state.tasks = state.tasks.filter((task) => task.goalId !== goalId);
  state.projects = state.projects.filter((project) => project.goalId !== goalId);
  saveState();
  renderAll();
}

function deleteProject(projectId) {
  state.projects = state.projects.filter((project) => project.id !== projectId);
  saveState();
  renderAll();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveState();
  renderAll();
}

function deleteEvent(eventId) {
  state.plannerEvents = state.plannerEvents.filter((event) => event.id !== eventId);
  saveState();
  renderPlanner();
}

function exportBackup() {
  const payload = {
    energy: state.energy,
    goals: state.goals,
    projects: state.projects,
    tasks: state.tasks,
    plannerEvents: state.plannerEvents,
    activityLog: state.activityLog
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "life-dashboard-backup.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!imported || typeof imported !== "object") {
        throw new Error("Backup format is invalid");
      }

      state = {
        ...state,
        energy: typeof imported.energy === "number" ? imported.energy : state.energy,
        goals: Array.isArray(imported.goals) ? imported.goals : state.goals,
        projects: Array.isArray(imported.projects) ? imported.projects : state.projects,
        tasks: Array.isArray(imported.tasks) ? imported.tasks : state.tasks,
        plannerEvents: Array.isArray(imported.plannerEvents) ? imported.plannerEvents : state.plannerEvents,
        activityLog: Array.isArray(imported.activityLog) ? imported.activityLog : state.activityLog
      };

      saveState();
      renderAll();
      alert("Backup restored successfully.");
    } catch (error) {
      alert("The selected file is not a valid backup.");
    }
  };

  reader.readAsText(file);
}

function getGoalTasks(goalId) {
  return state.tasks.filter((task) => task.goalId === goalId);
}

function getGoalProgress(goalId) {
  const tasks = getGoalTasks(goalId);
  if (!tasks.length) return 0;

  const done = tasks.filter((task) => task.done).length;
  return Math.round((done / tasks.length) * 100);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);

    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      goals: Array.isArray(parsed.goals) ? parsed.goals : structuredClone(defaultState.goals),
      projects: Array.isArray(parsed.projects) ? parsed.projects : structuredClone(defaultState.projects),
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaultState.tasks),
      plannerEvents: Array.isArray(parsed.plannerEvents) ? parsed.plannerEvents : [],
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : []
    };
  } catch (error) {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
