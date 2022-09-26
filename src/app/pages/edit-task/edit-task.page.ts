import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { TaskImage } from 'src/app/interfaces/task-image';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.page.html',
  styleUrls: ['./edit-task.page.scss'],
})
export class EditTaskPage implements ViewWillEnter, ViewDidEnter {

  componentLoaded: boolean = false

  user: User

  task: Task = {title: '', description: '', images: [], completed: false, date: null, dateLimit: null} as Task

  @Input()
  dateLimit: string = null

  constructor(
    private utils: UtilsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
    private fireStorageService: FireStorageService
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this
  }

  async ionViewWillEnter() {
    const taskId = this.activatedRoute.snapshot.paramMap.get('id')

    this.user = await this.userService.getUser()

    if (!this.user) return this.userService.handleUserDoesNotExists()

    const tasks = await this.userService.getTasks()
    this.task   = tasks.filter(t => t.id === taskId)[0]
    // this.dateLimit = this.task.dateLimit ? new Date(this.task.dateLimit).toLocaleString() : ''

    this.setDateLimit(new Date(this.task.dateLimit))

    if (!this.task) {
      // Avoid reference error in template
      this.task = {title: '', description: '', images: [], completed: false, date: null, dateLimit: null} as Task

      this.handleTaskDoesNotExist()
      return
    }
  }

  ionViewDidEnter() {
    if (this.componentLoaded) return 

    this.componentLoaded = true

    // Show optional images when clicking the 'Show Optional' button
    const btnOptional = document.querySelector('.btn-optional') as HTMLIonButtonElement
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
      if (!ionImg.matches('app-edit-task ion-img.image')) return

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

  async handleTaskDoesNotExist() {
    await this.utils.alert({
      header: 'Task Error',
      message: `This task doesn't exist or was deleted`,
      buttons: [{text: 'Ok', id: 'confirm-button'}]
    })

    this.router.navigateByUrl('/main')
  }

  async updateTask() {
    if (this.task.title === '') {
      await this.emptyTitleAlert()

      const inputTitle = document.querySelector('.task-title') as HTMLIonInputElement
      inputTitle.classList.add('error')

      return
    }

    await this.userService.updateTask(this.task)
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

  emptyTitleAlert() {
    return this.utils.alert({
      header: 'Task Error',
      message: 'Title cannot be empty',
      buttons: ['Ok']
    })
  }

}
