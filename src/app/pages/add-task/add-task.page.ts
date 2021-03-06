import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewDidEnter, ViewWillEnter } from '@ionic/angular';
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

export class AddTaskPage implements ViewWillEnter, ViewDidEnter {

  componentLoaded: boolean = false

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

    if (!this.user) return this.userService.handleUserDoesNotExists()
  }

  ionViewDidEnter() {
    if (this.componentLoaded) return

    this.componentLoaded = true

    // Show optional images when clicking the 'Show Optional' button
    const btnOptional = document.querySelector('.btn-optional') as HTMLElement
    const optional = document.querySelector('.optional') as HTMLDivElement

    btnOptional.addEventListener('click', event => {
      if (optional.hidden) optional.hidden = false
      else                 optional.hidden = true
    })

    // Remove red highligh in input task-name on focus
    const inputTitle = document.querySelector('.task-title') as HTMLIonInputElement
    inputTitle.firstChild.addEventListener('focus', event => inputTitle.classList.remove('error'))

    // Toggle between 'cover' and 'contain' values of 'object-fit' in 'task-images' on click
    window.addEventListener('click', event => {
      const ionImg = event.target as HTMLIonImgElement
      if (!ionImg.matches('app-view-task ion-img.image')) return

      const imgObj = this.task.images.filter(img => img.src === ionImg.src)[0]
      if (imgObj.objectFit === 'cover') imgObj.objectFit = 'contain'
      else                              imgObj.objectFit = 'cover'
    })

    // Remove images when clicking on the 'X' button
    window.addEventListener('click', event => {
      const removeBtn = event.target as HTMLDivElement
      if (!removeBtn.matches('.remove-img')) return

      const ionImg = removeBtn.parentElement.querySelector('ion-img.image') as HTMLIonImgElement

      this.task.images = this.task.images.filter(img => img.src !== ionImg.src)
    })
  }

  async addTask() {
    if (this.task.title === '') {
      await this.emptyTitleAlert()

      const inputTitle = document.querySelector('.task-title') as HTMLIonButtonElement
      inputTitle.classList.add('error')

      return
    }

    await this.userService.addTask(this.task)
    this.router.navigateByUrl('/main')
  }

  async addImage() {
    const imageFile = await this.utils.requestFile('image/*') as File

    const image = {src: this.userService.loadingImage, objectFit: 'cover'} as Image
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
