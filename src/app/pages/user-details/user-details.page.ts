import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.page.html',
  styleUrls: ['./user-details.page.scss'],
})

export class UserDetailsPage {

  user: User = {} as User

  localUser: User

  constructor(
    public userService: UserService,
    public authService: AuthService,
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

  async goToEditPage() {
    if (!this.user) {
      await this.utils.alert({
        header: 'Cannot edit profile while offline',
        buttons: ['Ok']
      })

      return
    }

    this.router.navigateByUrl('/user-details-edit')
  }

  async ionViewWillEnter() {
    const cancelLoader = await this.utils.showLoader({message: 'Profile loading. Please wait.'}, 500)
    this.user = await this.userService.getUser()

    if (!this.user) {
      cancelLoader()
      await this.userService.handleUserDoesNotExists()

      this.localUser = await this.userService.getLocalUser()
    }

    console.log({user: this.user, localUser: this.localUser})

    this.tasks = await this.userService.getTasks()

    cancelLoader()

    console.log(this.tasks)

    this.taskCompletedLength = this.getCompletedTasksLength()
    this.taskDateLimitLength = this.getDateLimitTaskLength()
    this.taskDateLimitOverLength = this.getDateLimitOverTaskLength()
  }

  getDateLimitTaskLength() {
    return this.tasks.filter(task => {
      if (task.completed) return false
      if (typeof task.dateLimit !== 'number') return false

      return task.dateLimit > Date.now()
    }).length
  }

  getDateLimitOverTaskLength() {
    return this.tasks.filter(task => {
      if (task.completed) return false
      if (typeof task.dateLimit !== 'number') return false

      return task.dateLimit <= Date.now()
    }).length
  }

  getCompletedTasksLength() {
    return this.tasks.filter(task => task.completed).length
  }

}
