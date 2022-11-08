import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UtilsService } from './utils.service';
import { User } from '../interfaces/user'
import { Task } from '../interfaces/task';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  
  loadingImage = 'assets/images/loading.gif'

  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private utils: UtilsService,
    private router: Router,
    private auth: Auth
  ) {

    this.auth.onAuthStateChanged(() => {
      const currentUser = this.auth.currentUser
      if (!currentUser) return

      this.tasksPath = `${this.usersPath}/${currentUser.uid}/tasks`
    })

  }

  tasksPath: string = ''

  usersPath = 'users'

  userPlaceholder = 'assets/images/user-placeholder.png'

  dataOptions = {idField: 'id'}


  // User

  async getUser(): Promise<User> {
    const currentUser = await this.authService.getCurrentAuthUser()

    if (!currentUser) return null

    const docRef = doc(this.firestore, `${this.usersPath}/${currentUser.uid}`)
    const observableData = docData(docRef, this.dataOptions)

    const user = await this.utils.observableToPromise(observableData)

    if (user) {
      const email = this.authService.currentUser.email

      Preferences.set({
        key: email,
        value: JSON.stringify(user)
      })
    }

    return user
  }

  async getLocalUser() {
    const email = this.authService.currentUser.email

    const result = await Preferences.get({key: email})
    const localUser = JSON.parse(result.value)

    return localUser
  }

  addUser(user: User) {
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  updateUser(user: User) {
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  userDoesNotExistAlertDisplayed = false

  async handleUserDoesNotExists() {
    if (this.userDoesNotExistAlertDisplayed) return

    this.userDoesNotExistAlertDisplayed = true

    await this.userDoesNotExistAlert()
  }

  userDoesNotExistAlert() {
    return this.utils.alert({
      header: 'Error',
      subHeader: 'User does not exist in the database or connection failed.',
      message: 'Data stored locally will be shown.',
      buttons: ['Ok']
    })
  }


  // Task

  addTask(task: Task) {
    const collectionRef = collection(this.firestore, this.tasksPath)
    return addDoc(collectionRef, task)
  }

  updateTask(task: Task) {
    const docRef = doc(this.firestore, `${this.tasksPath}/${task.id}`)
    return setDoc(docRef, task)
  }

  async getTasks(): Promise<Task[]> {
    const collectionRef = collection(this.firestore, `${this.tasksPath}`)
    const observableData = collectionData(collectionRef, this.dataOptions)

    const tasks = this.utils.observableToPromise(observableData)

    const user = await this.getUser()

    if (user) {
      Preferences.set({
        key: 'tasks',
        value: JSON.stringify(tasks)
      })
    }

    const result = await Preferences.get({key: 'tasks'})
    const localTasks = JSON.parse(result.value)

    return user ? tasks : localTasks
  }

  async deleteTask(task: Task) {
    const docRef = doc(this.firestore, `${this.tasksPath}/${task.id}`)
    return deleteDoc(docRef)
  }

}
