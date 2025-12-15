import { useEffect, useMemo, useRef } from 'react';
import ReactGantt, {
  type ReactGanttRef,
  type ReactGanttProps,
  type Link,
  type SerializedTask,
} from '@dhtmlx/trial-react-gantt';
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css';

import { useAtom, useSetAtom } from 'jotai';
import {
  ganttStateAtom,
  undoAtom,
  redoAtom,
  setZoomAtom,
  addTaskAtom,
  updateTaskAtom,
  deleteTaskAtom,
  addLinkAtom,
  updateLinkAtom,
  deleteLinkAtom,
} from '../store';

import Toolbar from './Toolbar';

export default function GanttComponent() {
  const ganttRef = useRef<ReactGanttRef>(null);

  const [ganttState] = useAtom(ganttStateAtom);
  const { tasks, links, config } = ganttState;
  const setZoomLevel = useSetAtom(setZoomAtom);
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);
  const addTask = useSetAtom(addTaskAtom);
  const updateTask = useSetAtom(updateTaskAtom);
  const deleteTask = useSetAtom(deleteTaskAtom);
  const addLink = useSetAtom(addLinkAtom);
  const updateLink = useSetAtom(updateLinkAtom);
  const deleteLink = useSetAtom(deleteLinkAtom);

  useEffect(() => {
    document.title = 'DHTMLX React Gantt | Jotai';
  }, []);

  const templates: ReactGanttProps['templates'] = useMemo(
    () => ({
      format_date: (date: Date) => date.toISOString(),
      parse_date: (value: string) => new Date(value),
    }),
    []
  );

  const data: ReactGanttProps['data'] = useMemo(
    () => ({
      save: (entity, action, payload, id) => {
        if (entity === 'task') {
          const task = payload as SerializedTask;
          if (action === 'create') return addTask(task);
          else if (action === 'update') updateTask(task);
          else if (action === 'delete') deleteTask(id);
        } else if (entity === 'link') {
          const link = payload as Link;
          if (action === 'create') return addLink(link);
          else if (action === 'update') updateLink(link);
          else if (action === 'delete') deleteLink(id);
        }
      },
    }),
    [addTask, addLink, updateTask, updateLink, deleteTask, deleteLink]
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar onUndo={undo} onRedo={redo} currentZoom={config.zoom.current} onZoom={setZoomLevel} />
      <ReactGantt ref={ganttRef} tasks={tasks} links={links} config={config} templates={templates} data={data} />
    </div>
  );
}
