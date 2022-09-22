import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})


export class MainPage implements ViewWillEnter {

  user: User

  tasks: Task[] = []

  Object = window.Object

  sortingOptions = {
    new: {uiValue: 'Newest', value: 'new'},
    old: {uiValue: 'Oldest', value: 'old'}
  }

  @Input()
  currentSortOption: string = ''

  constructor(
    public userService: UserService,
    private router: Router,
    private utils: UtilsService
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this
  }

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
      return
    }

    this.tasks = await this.userService.getTasks()

    this.sortTasksByOption(new CustomEvent('', {detail: {value: this.currentSortOption}}))
  }

  viewTask(task: Task) {
    this.router.navigateByUrl(`/view-task/${task.id}`)
  }

  editTask(task: Task) {
    this.router.navigateByUrl(`/edit-task/${task.id}`)
  }

  addTask() {
    this.router.navigateByUrl('/add-task')
  }

  deleteTask(task: Task) {
    return this.utils.alert({
      header: 'Task Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Ok',
          id: 'confirm-button',
          handler: async () => {
            await this.userService.deleteTask(task)
            this.tasks = await this.userService.getTasks()
          }
        },
        {text: 'Cancel', role: 'Cancel'}
      ],

    })
  }

  sortTasksByOption(evt: Event) {
    const event = evt as any as CustomEvent

    const {value} = event.detail

    switch (value) {
      case this.sortingOptions.new.value:
        this.sortByNewest()
      break

      case this.sortingOptions.old.value:
        this.sortByOldest()
      break

      default:
        this.sortByNewest()
    }
  }

  sortByNewest() {
    this.tasks.sort((task1, task2) => task1.date > task2.date ? -1 : 1)
  }

  sortByOldest() {
    this.tasks.sort((task1, task2) => task1.date > task2.date ? 1 : -1)
  }

}
