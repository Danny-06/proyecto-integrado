import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Image } from 'src/app/interfaces/image';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
})

export class AddTaskPage {

  user: User

  task: Task = {title: '', description: '', images: []} as Task

  constructor(
    public userService: UserService,
    private fireStorageService: FireStorageService,
    private router: Router,
    private utils: UtilsService
  ) {
    const win: any = window
    win[this.constructor.name] = this
  }

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
      return
    }

    const inputTitle = document.querySelector('.task-title') as HTMLIonInputElement
    inputTitle.firstChild.addEventListener('focus', event => inputTitle.classList.remove('error'))
  }

  async addTask() {
    if (this.task.title === '') {
      await this.emptyTitleAlert()

      const inputTitle = document.querySelector('.task-title') as HTMLIonInputElement
      inputTitle.classList.add('error')

      return
    }

    await this.userService.addTask(this.task)
    this.router.navigateByUrl('/main')
  }

  async addImage() {
    const imageFile = await this.utils.requestFile('image/*') as File

    const image = {src: this.userService.loadingImage} as Image
    this.task.images.push(image)

    const imageURL = await this.fireStorageService.uploadFile(imageFile, 'tasks', `${imageFile.name} - ${Date.now()}`)

    image.src = imageURL
  }

  removeImage(image: Image) {
    this.task.images = this.task.images.filter(img => img.src !== image.src)
  }

  emptyTitleAlert() {
    return this.utils.alert({
      header: 'Task Error',
      message: 'Title cannot be empty',
      buttons: ['Ok']
    })
  }

}
