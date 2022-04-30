import { Image } from "./image"

export interface Task {
  id: string
  title: string
  description: string
  images: Image[]
}
