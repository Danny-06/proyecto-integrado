import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { TaskImage } from 'src/app/interfaces/task-image';
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

  task: Task = {title: '', description: '', images: [], completed: false, date: null, dateLimit: null} as Task

  dateLimit: string = 'No date limit specified'

  rootNode

  constructor(
    public userService: UserService,
    private fireStorageService: FireStorageService,
    private router: Router,
    private utils: UtilsService,
    private elementReference: ElementRef
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this

    this.rootNode = this.elementReference.nativeElement as HTMLElement
  }

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.utils.alert({
        header: 'Cannot create tasks while offline',
        buttons: ['Ok']
      })

      this.router.navigateByUrl('/main')

      return
    }
  }

  ionViewDidEnter() {
    if (this.componentLoaded) return

    this.componentLoaded = true

    // Show optional images when clicking the 'Show Optional' button
    const btnOptional = this.rootNode.querySelector('.btn-optional') as HTMLElement
    const optional = this.rootNode.querySelector('.optional') as HTMLDivElement

    btnOptional.addEventListener('click', event => {
      if (optional.hidden) optional.hidden = false
      else                 optional.hidden = true
    })

    // Remove red highligh in input task-name on focus
    const inputTitle = this.rootNode.querySelector('.task-title') as HTMLIonInputElement
    inputTitle.firstChild.addEventListener('focus', event => inputTitle.classList.remove('error'))

    // Toggle between 'cover' and 'contain' values of 'object-fit' in 'task-images' on click
    window.addEventListener('click', event => {
      const ionImg = event.target as HTMLIonImgElement
      if (!ionImg.matches('app-add-task ion-img.image')) return

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

      const inputTitle = this.rootNode.querySelector('.task-title') as HTMLIonButtonElement
      inputTitle.classList.add('error')

      return
    }

    this.task.date = Date.now()

    await this.userService.addTask(this.task)
    this.router.navigateByUrl('/main')
  }

  async addImage() {
    const imageFile = await this.utils.requestFile('image/*') as File

    const image = {src: this.userService.loadingImage, objectFit: 'cover'} as TaskImage
    this.task.images.push(image)

    const imageURL = await this.fireStorageService.uploadFile(imageFile, 'tasks', `${imageFile.name} - ${Date.now()}`)

    image.src = imageURL
  }

  async showDateLimitPicker() {
    const [date, error] = await this.utils.showDateTimePicker()

    if (error) {
      return
    }

    this.setDateLimit(date)
    this.task.dateLimit = date?.getTime() ?? null
  }

  setDateLimit(date: Date) {
    this.dateLimit = date?.toLocaleString() ?? 'No date limit specified'
  }

  removeImage(image: TaskImage) {
    this.task.images = this.task.images.filter(img => img.src !== image.src)
  }

  emptyTitleAlert() {
    return this.utils.alert({
      header: 'Task Error',
      message: 'Title cannot be empty',
      buttons: ['Ok']
    })
  }

  avoidInputSelection(event) {
    setTimeout(() => {
      const input = event.target.matches('input') ?
                    event.target :
                    (
                      event.target.querySelector('input') ??
                      event.target.parentElement.querySelector('input')
                    )

      input.selectionStart = 0
      input.selectionEnd = 0
    })
  }

}
