import { atom, type Getter, type Setter } from 'jotai';
import type { Link, GanttConfig, SerializedTask } from '@dhtmlx/trial-react-gantt';
import { seedTasks, seedLinks, defaultZoomLevels } from './seed/Seed';
import type { ZoomLevel } from './seed/Seed';

interface GanttState {
  tasks: SerializedTask[];
  links: Link[];
  config: GanttConfig;
}
export const ganttStateAtom = atom<GanttState>({
  tasks: seedTasks,
  links: seedLinks,
  config: { zoom: defaultZoomLevels },
});

const maxHistory = 50;

export const pastAtom = atom<GanttState[]>([]);
export const futureAtom = atom<GanttState[]>([]);

const pushHistory = (get: Getter, set: Setter, state: GanttState) => {
  const past = [...get(pastAtom), state];
  if (past.length > maxHistory) past.shift();
  set(pastAtom, past);
  set(futureAtom, []);
};

export const undoAtom = atom(null, (get, set) => {
  const past = get(pastAtom);
  if (past.length === 0) return;
  const previous = past[past.length - 1];
  set(pastAtom, past.slice(0, -1));
  set(futureAtom, [get(ganttStateAtom), ...get(futureAtom)]);
  set(ganttStateAtom, previous);
});

export const redoAtom = atom(null, (get, set) => {
  const future = get(futureAtom);
  if (future.length === 0) return;
  const next = future[0];
  set(futureAtom, future.slice(1));
  set(pastAtom, [...get(pastAtom), get(ganttStateAtom)]);
  set(ganttStateAtom, next);
});

export const addTaskAtom = atom(null, (get, set, task: SerializedTask) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    tasks: [...get(ganttStateAtom).tasks, { ...task, id: `DB_ID:${task.id}` }],
  });
  return { ...task, id: `DB_ID:${task.id}` };
});

export const updateTaskAtom = atom(null, (get, set, task: SerializedTask) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    tasks: get(ganttStateAtom).tasks.map((t) => (String(t.id) === String(task.id) ? { ...t, ...task } : t)),
  });
});

export const deleteTaskAtom = atom(null, (get, set, id: string | number) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    tasks: get(ganttStateAtom).tasks.filter((task) => String(task.id) !== String(id)),
  });
});

export const addLinkAtom = atom(null, (get, set, link: Link) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    links: [...get(ganttStateAtom).links, { ...link, id: `DB_ID:${link.id}` }],
  });
  return { ...link, id: `DB_ID:${link.id}` };
});

export const updateLinkAtom = atom(null, (get, set, link: Link) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    links: get(ganttStateAtom).links.map((l) => (String(l.id) === String(link.id) ? { ...l, ...link } : l)),
  });
});

export const deleteLinkAtom = atom(null, (get, set, id: string | number) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    links: get(ganttStateAtom).links.filter((l) => String(l.id) !== String(id)),
  });
});

export const setZoomAtom = atom(null, (get, set, level: ZoomLevel) => {
  pushHistory(get, set, get(ganttStateAtom));
  set(ganttStateAtom, {
    ...get(ganttStateAtom),
    config: { ...get(ganttStateAtom).config, zoom: { ...get(ganttStateAtom).config.zoom, current: level } },
  });
});
