import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})


export class MainPage implements ViewWillEnter {

  user: User

  constructor(
    public userService: UserService,
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) {
    const win: any = window
    win[this.constructor.name] = this
  }

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    // If user is not stored in the database
    // then delete its account and redirect
    if (!this.user) {
      await this.handleUserDoesNotExist()

      this.authService.removeUser()
      this.router.navigateByUrl('/register')
      return
    }
  }

  handleUserDoesNotExist() {
    return this.utils.alert({
      header: 'Error',
      subHeader: 'User does not exist in the database.',
      message: 'The account associated will be remove and you will be redirected to register page.'
    })
  }

}
