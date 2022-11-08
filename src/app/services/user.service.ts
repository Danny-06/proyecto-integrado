import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { UtilsService } from './utils.service';
import { User } from '../interfaces/user'
import { Task } from '../interfaces/task';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

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
    private auth: Auth,
    private storage: Storage
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

    return user
  }

  addUser(user: User) {
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  updateUser(user: User) {
    const docRef = doc(this.firestore, `${this.usersPath}/${user.id}`)
    return setDoc(docRef, user)
  }

  // If user is not stored in the database
  // show an 'ion-alert'
  // then delete its account and redirect
  async handleUserDoesNotExists() {
    await this.userDoesNotExistAlert()

    // this.authService.removeUser()
    this.router.navigateByUrl('/login')
  }

  userDoesNotExistAlert() {
    return this.utils.alert({
      header: 'Error',
      subHeader: 'User does not exist in the database or connection failed.',
      message: 'You will be redirected to login page.',
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

    return tasks.catch(reason => {})
  }

  async deleteTask(task: Task) {
    const docRef = doc(this.firestore, `${this.tasksPath}/${task.id}`)
    return deleteDoc(docRef)
  }

}
