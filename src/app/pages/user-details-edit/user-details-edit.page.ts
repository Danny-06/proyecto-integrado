import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-user-details-edit',
  templateUrl: './user-details-edit.page.html',
  styleUrls: ['./user-details-edit.page.scss'],
})

export class UserDetailsEditPage {

  user: User = {} as User

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService,
    private fireStorageService: FireStorageService
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this
  }

  tasks: Task[]

  taskDateLimitLength: number
  taskCompletedLength: number
  taskDateLimitOverLength: number

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.utils.alert({
        header: 'Cannot edit profile while offline',
        buttons: ['Ok']
      })

      this.router.navigateByUrl('/main')

      return
    }

    this.tasks = await this.userService.getTasks()

    this.taskCompletedLength = this.getCompletedTasksLength()
    this.taskDateLimitLength = this.getDateLimitTaskLength()
    this.taskDateLimitOverLength = this.getDateLimitOverTaskLength()

    console.log(this.user)
  }

  async changeProfilePicture() {
    const file = await this.utils.requestFile() as File

    this.user.image = this.userService.loadingImage

    const [url, uploadFileError] = await this.utils.promiseWrapper(
      this.fireStorageService.uploadFile(file, 'images', `${file.name} - ${Date.now()}`)
    )

    if (uploadFileError) {
      this.utils.alert({
        header: 'Network Error',
        message: 'An error has accurred uploading the image'
      })

      return
    }

    this.user.image = url
  }

  getDateLimitTaskLength() {
    return this.tasks.filter(task => {
      if (task.completed) return false

      return typeof task.dateLimit === 'number'
    }).length
  }

  getDateLimitOverTaskLength() {
    return this.tasks.filter(task => {
      if (task.completed) return false
      if (typeof task.dateLimit !== 'number') return false

      return task.dateLimit < Date.now()
    }).length
  }

  getCompletedTasksLength() {
    return this.tasks.filter(task => task.completed).length
  }

  saveChanges() {
    this.userService.updateUser(this.user)
    .then(() => this.router.navigateByUrl('/user-details'))
    .catch(() => {
      this.utils.alert({
        header: 'Unexpected Error',
        message: 'An error ocurred'
      })
    })
  }

}
