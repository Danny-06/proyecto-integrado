import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UtilsService } from './utils.service';
import { User } from '../interfaces/user'
import { Task } from '../interfaces/task';
import { User as AuthUser } from '@angular/fire/auth'

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private utils: UtilsService,
  ) {}

  // loadingImage = 'assets/animals/loading.gif'

  get authUser(): AuthUser { return this.authService.getCurrentUser() }

  usersPath = 'users'
  tasksPath = `${this.usersPath}/${this.authUser?.uid}/tasks`

  userPlaceholder = 'assets/images/user-placeholder.png'

  dataOptions = {idField: 'id'}


  getUser(): Promise<User> {
    if (!this.authUser) return null

    const docRef = doc(this.firestore, `${this.usersPath}/${this.authUser.uid}`)
    const observableData = docData(docRef, this.dataOptions)

    return this.utils.observableToPromise(observableData)
  }

  addUser(user: User) {
    // const collectionRef = collection(this.firestore, this.usersPath)
    // return addDoc(collectionRef, user)

    // Set Custom id to match Document ID to field ID
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  updateUser(user: User) {
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  addTask(task: Task) {
    const collectionRef = collection(this.firestore, this.tasksPath)
    return addDoc(collectionRef, task)
  }

  updateTask(task: Task) {
    const docRef = doc(this.firestore, `${this.tasksPath}/${task.id}`)
    return setDoc(docRef, task)
  }

  getTasks(): Promise<Task[]> {
    const docRef = doc(this.firestore, `${this.tasksPath}`)
    const observableData = docData(docRef, this.dataOptions)

    return this.utils.observableToPromise(observableData)
  }

}
