import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.page.html',
  styleUrls: ['./view-task.page.scss'],
})
export class ViewTaskPage implements ViewWillEnter {

  user: User

  task: Task = {} as Task

  taskDate: string

  dateLimit: string

  constructor(
    private utils: UtilsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public userService: UserService
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this
  }

  async ionViewWillEnter() {
    const taskId = this.activatedRoute.snapshot.paramMap.get('id')

    if (!taskId) {
      this.handleTaskDoesNotExist()
      return
    }

    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
    }

    const tasks = await this.userService.getTasks()
    this.task   = tasks.filter(t => t.id === taskId)[0]

    this.taskDate = new Date(this.task.date).toLocaleString()
    this.dateLimit = this.task.dateLimit != null ? new Date(this.task.dateLimit).toLocaleString() : 'No date limit specified'

    if (!this.task) {
      // Avoid reference error in template
      this.task = {title: '', description: '', images: []} as Task

      this.handleTaskDoesNotExist()
      return
    }
  }

  async handleTaskDoesNotExist() {
    await this.utils.alert({
      header: 'Task Error',
      message: `This task doesn't exist or was deleted`,
      buttons: [{text: 'Ok', id: 'confirm-button'}]
    })

    this.router.navigateByUrl('/main')
  }

  async toogleTaskState() {
    if (!this.user) {
      await this.utils.alert({
        header: 'Cannot mark tasks as completed while offline',
        buttons: ['Ok']
      })

      return
    }

    this.task.completed = !this.task.completed

    await this.userService.updateTask(this.task)

    let completeState = 'uncompleted'

    if (this.task.completed) {
      completeState = 'completed'
    }

    this.utils.alert({
      message: `You marked this task as ${completeState}.`
    }, 2500)
  }

}
