import type { ConsultantTask } from "../../data/tasks";
import {
  TASK_LABEL_HOLON,
  TASK_META_HOLON,
  TASK_ROW_HOLON,
  TASK_STATUS_TOGGLE_HOLON,
  TASKS_SECTION_HOLON,
} from "../docs/boardBodyHolons";
import { HolonBoundary } from "../docs/HolonBoundary";
import type { Tokens } from "../tokens";
import { TaskRow } from "./TaskRow";
import { TasksSectionHeader } from "./TasksSectionHeader";

export function TasksBody({
  tasks,
  open,
  onToggleOpen,
  openTaskCount,
  activeTouchpointId,
  onTaskClick,
  onToggleStatus,
  t,
}: {
  tasks: ConsultantTask[];
  open: boolean;
  onToggleOpen: () => void;
  openTaskCount: number;
  activeTouchpointId: string | null;
  onTaskClick: (task: ConsultantTask) => void;
  onToggleStatus: (taskId: string) => void;
  t: Tokens;
}) {
  const tasksInView = open && tasks.length > 0;

  return (
    <>
      <HolonBoundary
        id={TASK_ROW_HOLON.id}
        label={TASK_ROW_HOLON.label}
        icon={TASK_ROW_HOLON.icon}
        order={TASK_ROW_HOLON.order}
        parentId={TASKS_SECTION_HOLON.id}
        registerOnly
        inView={tasksInView}
        onFocus={onToggleOpen}
        t={t}
      >
        <HolonBoundary
          id={TASK_STATUS_TOGGLE_HOLON.id}
          label={TASK_STATUS_TOGGLE_HOLON.label}
          lucideIcon={TASK_STATUS_TOGGLE_HOLON.lucideIcon}
          order={TASK_STATUS_TOGGLE_HOLON.order}
          registerOnly
          inView={tasksInView}
          onFocus={onToggleOpen}
          t={t}
        >
          {null}
        </HolonBoundary>
        <HolonBoundary
          id={TASK_LABEL_HOLON.id}
          label={TASK_LABEL_HOLON.label}
          icon={TASK_LABEL_HOLON.icon}
          order={TASK_LABEL_HOLON.order}
          registerOnly
          inView={tasksInView}
          onFocus={onToggleOpen}
          t={t}
        >
          {null}
        </HolonBoundary>
        <HolonBoundary
          id={TASK_META_HOLON.id}
          label={TASK_META_HOLON.label}
          icon={TASK_META_HOLON.icon}
          order={TASK_META_HOLON.order}
          registerOnly
          inView={tasksInView}
          onFocus={onToggleOpen}
          t={t}
        >
          {null}
        </HolonBoundary>
      </HolonBoundary>

      <TasksSectionHeader count={openTaskCount} open={open} onToggle={onToggleOpen} t={t} />

      {open &&
        tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isActive={activeTouchpointId === task.touchpointId}
            t={t}
            onTaskClick={onTaskClick}
            onToggleStatus={onToggleStatus}
          />
        ))}
    </>
  );
}
