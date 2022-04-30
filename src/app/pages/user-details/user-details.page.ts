import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.page.html',
  styleUrls: ['./user-details.page.scss'],
})

export class UserDetailsPage {

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

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
      return
    }
  }

}
