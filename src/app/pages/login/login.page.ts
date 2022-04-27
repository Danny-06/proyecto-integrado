import { Component, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  email: string = ''
  password: string = ''
  image: string = ''

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private firestorage: FireStorageService,
    private utils: UtilsService
  ) {
    const win: any = window
    win[this.constructor.name] = this
  }

  ngOnInit() {
    this.email = 'danny@gmail.com'
    this.password = '123456'
  }

  async login() {
    const pw = this.utils.promiseWrapper
    const [, error]: [UserCredential, FirebaseError] = await pw(this.authService.login(this.email, this.password))

    if (error) {
      const message = error.message.replace('Firebase:', '').replace(`(${error.code})`, '')
      this.accountError(`${message}<br>${error.code}`)
      return
    }

    this.router.navigateByUrl('/main')
  }



  // Alerts

  async accountError(message: string) {
    await this.utils.alert({
      header: 'Error',
      subHeader: `We couldn't create your account`,
      message,
      buttons: ['Ok']
    })
  }

}
