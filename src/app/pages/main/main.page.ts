import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { Task } from 'src/app/interfaces/task';
import { User } from 'src/app/interfaces/user';
import { FireNotificationsService } from 'src/app/services/fire-notifications.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})


export class MainPage implements ViewWillEnter {

  constructor(
    public userService: UserService,
    private router: Router,
    private utils: UtilsService,
    private fireNotificationsService: FireNotificationsService
  ) {
    const win: any = window
    win.pages[this.constructor.name] = this
    win.pages.notifications = this.fireNotificationsService
  }

  user: User

  tasks: Task[] = []

  tasksState: Task[] = this.tasks

  dateLimit: string

  Object = window.Object

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
      return
    }

    this.tasks = await this.userService.getTasks()
    this.tasksState = [...this.tasks]

    this.sortTasksByOption(this.currentSortOption)
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

  async deleteTask(task: Task) {
    await this.utils.alert({
      header: 'Task Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Ok',
          id: 'confirm-button',
          handler: async () => {
            await this.userService.deleteTask(task)
            this.tasks = await this.userService.getTasks()

            this.filterTasksByOption(this.currentFilterOption)
          }
        },
        {text: 'Cancel', role: 'Cancel'}
      ],

    })
  }

  sortingOptions = {
    new:               {uiValue: 'Newest', value: 'new'},
    old:               {uiValue: 'Oldest', value: 'old'},
    nearestdatelimit:  {uiValue: 'Nearest Date Limit', value: 'nearestdatelimit'},
    farthestdatelimit: {uiValue: 'Farthest Date Limit', value: 'farthestdatelimit'}
  }

  @Input()
  currentSortOption: string = this.sortingOptions.new.value

  handleSortOnChange(evt: Event) {
    const event = evt as any as CustomEvent
    const {value} = event.detail

    this.sortTasksByOption(value)
  }

  sortTasksByOption(value: string) {
    switch (value) {
      case this.sortingOptions.new.value:
        this.sortByNewest()
      break

      case this.sortingOptions.old.value:
        this.sortByOldest()
      break

      case this.sortingOptions.nearestdatelimit.value:
        this.sortByNearestDateLimit()
      break

      case this.sortingOptions.farthestdatelimit.value:
        this.sortByFarthestDateLimit()
      break

      default:
        this.sortByNewest()
    }
  }

  sortByNewest() {
    this.tasksState.sort((task1, task2) => task1.date > task2.date ? -1 : 1)
  }

  sortByOldest() {
    this.tasksState.sort((task1, task2) => task1.date > task2.date ? 1 : -1)
  }

  sortByDateLimit() {
    this.tasksState.sort((task1, task2) => task1.dateLimit == null ? -1 : 1)
  }

  sortByNearestDateLimit() {
    this.sortByDateLimit()

    this.tasksState.sort((task1, task2) => {
      if (task1.dateLimit == null || task2.dateLimit == null) return -1

      return task1.dateLimit > task2.dateLimit ? 1 : -1
    })
  }

  sortByFarthestDateLimit() {
    this.sortByDateLimit()

    this.tasksState.sort((task1, task2) => {
      if (task1.dateLimit == null || task2.dateLimit == null) return -1

      return task1.dateLimit < task2.dateLimit ? 1 : -1
    })
  }

  filterOptions = {
    nofilter:         {uiValue: 'No Filter',           value: 'nofilter'},
    complete:         {uiValue: 'Completed Tasks',     value: 'complete'},
    uncomplete:       {uiValue: 'Uncompleted Tasks',   value: 'uncomplete'},
    datelimit:        {uiValue: 'Date Limit Tasks',    value: 'datelimit'},
    nodatelimit:      {uiValue: 'No Date Limit Tasks', value: 'nodatelimit'},
    datelimitover:    {uiValue: 'Date Limit Over',     value: 'datelimitover'},
    datelimitnotover: {uiValue: 'Date Limit Not Over', value: 'datelimitnotover'}
  }

  @Input()
  currentFilterOption: string = this.filterOptions.nofilter.value

  handleFilterOnChange(evt: Event) {
    const event = evt as any as CustomEvent
    const {value} = event.detail

    this.filterTasksByOption(value)
  }

  filterTasksByOption(value: string) {
    switch (value) {
      case this.filterOptions.nofilter.value:
        this.revertFilter()
      break

      case this.filterOptions.complete.value:
        this.filterByComplete()
      break

      case this.filterOptions.uncomplete.value:
        this.filterByUnComplete()
      break

      case this.filterOptions.datelimit.value:
        this.filterByDateLimit()
      break

      case this.filterOptions.nodatelimit.value:
        this.filterByNoDateLimit()
      break

      case this.filterOptions.datelimitover.value:
        this.filterByDateLimitOver()
      break

      case this.filterOptions.datelimitnotover.value:
        this.filterByDateLimitNotOver()
      break

      default:
        this.revertFilter()
    }

    this.sortTasksByOption(this.currentSortOption)
  }

  filterByComplete() {
    this.tasksState = this.tasks.filter(task => task.completed)
  }

  filterByUnComplete() {
    this.tasksState = this.tasks.filter(task => !task.completed)
  }

  filterByDateLimit() {
    this.tasksState = this.tasks.filter(task => task.dateLimit != null)
  }

  filterByNoDateLimit() {
    this.tasksState = this.tasks.filter(task => task.dateLimit == null)
  }

  filterByDateLimitOver() {
    this.tasksState = this.tasks.filter(task => {
      if (task.completed || task.dateLimit == null) return false
      return Date.now() > task.dateLimit
    })
  }

  filterByDateLimitNotOver() {
    this.tasksState = this.tasks.filter(task => {
      if (task.dateLimit == null) return false
      return Date.now() < task.dateLimit
    })
  }

  revertFilter() {
    this.tasksState = [...this.tasks]
  }


  getFormatedDate(date: number) {
    return date != null ? new Date(date).toLocaleDateString() : ''
  }


  // CSS Classes

  isCompletedClass(task: Task) {
    return task.completed ? 'completed' : ''
  }

  isDateLimitOverClass(task: Task) {
    if (task.dateLimit == null) return ''

    return Date.now() > task.dateLimit ? 'date-limit-over' : ''
  }

}
