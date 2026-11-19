function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function isDashboardState(value) {
  const record = item => item !== null && typeof item === 'object' && !Array.isArray(item);
  const text = item => typeof item === 'string';
  const optionalText = item => item == null || text(item);
  const optionalNumber = item => item == null || (typeof item === 'number' && Number.isFinite(item));
  const linkedGoal = item => item == null || text(item);

  return record(value)
    && typeof value.energy === 'number' && Number.isFinite(value.energy)
    && Array.isArray(value.goals) && value.goals.every(goal =>
      record(goal) && text(goal.id) && text(goal.name) && text(goal.area)
      && optionalText(goal.description) && optionalNumber(goal.progress))
    && Array.isArray(value.projects) && value.projects.every(project =>
      record(project) && text(project.id) && text(project.name) && linkedGoal(project.goalId)
      && optionalText(project.description))
    && Array.isArray(value.tasks) && value.tasks.every(task =>
      record(task) && text(task.id) && text(task.name) && linkedGoal(task.goalId)
      && typeof task.done === 'boolean' && optionalNumber(task.time) && optionalText(task.date))
    && Array.isArray(value.events) && value.events.every(event =>
      record(event) && text(event.id) && text(event.title) && text(event.date) && optionalText(event.time))
    && Array.isArray(value.history);
}
