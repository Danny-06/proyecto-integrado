import { TaskImage } from "./task-image"

export interface Task {
  id: string
  title: string
  description: string
  images: TaskImage[]
  completed: boolean
  date: number
  dateLimit: number
}
