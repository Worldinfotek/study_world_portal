export interface LocalTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
  listId?: string;
}

export interface LocalTaskList {
  id: string;
  title: string;
  updated?: string;
}

const STORAGE_KEYS = {
  TASK_LISTS: 'swc_task_lists_v1',
  TASKS: 'swc_tasks_v1',
};

const INITIAL_TASK_LISTS: LocalTaskList[] = [
  { id: '@default', title: 'Default My Tasks' },
  { id: 'list_admissions', title: 'Admissions & University Filing' },
  { id: 'list_visas', title: 'Embassy & Visa Operations' },
];

const INITIAL_TASKS: LocalTaskItem[] = [];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Failed reading storage key "${key}", using fallback`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed saving storage key "${key}"`, err);
  }
}

export const StorageService = {
  getTaskLists(): LocalTaskList[] {
    return loadFromStorage<LocalTaskList[]>(STORAGE_KEYS.TASK_LISTS, INITIAL_TASK_LISTS);
  },
  saveTaskLists(lists: LocalTaskList[]): void {
    saveToStorage(STORAGE_KEYS.TASK_LISTS, lists);
  },
  addTaskList(list: LocalTaskList): void {
    const lists = this.getTaskLists();
    if (!lists.some((l) => l.id === list.id)) {
      lists.push(list);
      this.saveTaskLists(lists);
    }
  },
  getTasks(listId?: string): LocalTaskItem[] {
    const all = loadFromStorage<LocalTaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const targetList = listId || '@default';
    return all.filter((t) => (t.listId || '@default') === targetList);
  },
  saveTasks(listId: string | undefined, tasks: LocalTaskItem[]): void {
    const all = loadFromStorage<LocalTaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const targetList = listId || '@default';
    const otherTasks = all.filter((t) => (t.listId || '@default') !== targetList);
    const formatted = tasks.map((t) => ({ ...t, listId: targetList }));
    saveToStorage(STORAGE_KEYS.TASKS, [...formatted, ...otherTasks]);
  },
  saveTask(listId: string | undefined, task: LocalTaskItem): void {
    const all = loadFromStorage<LocalTaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const targetList = listId || '@default';
    const existingIdx = all.findIndex((t) => t.id === task.id);
    const updated = { ...task, listId: targetList };
    if (existingIdx >= 0) all[existingIdx] = updated;
    else all.unshift(updated);
    saveToStorage(STORAGE_KEYS.TASKS, all);
  },
  deleteTask(taskId: string): void {
    const all = loadFromStorage<LocalTaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    saveToStorage(STORAGE_KEYS.TASKS, all.filter((t) => t.id !== taskId));
  },
};
