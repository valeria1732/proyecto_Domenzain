/**
 * Estados posibles de una tarea.
 * Refleja el flujo de trabajo: PENDING → IN_PROGRESS → DONE
 */
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
