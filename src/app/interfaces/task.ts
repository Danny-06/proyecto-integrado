import { TaskImage } from "./task-image"

export interface Task {
  id: string
  title: string
  description: string
  images: TaskImage[],
  date: number
}
