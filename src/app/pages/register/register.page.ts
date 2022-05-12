import { Component, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { UserCredential } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { FireStorageService } from 'src/app/services/fire-storage.service';
import { UserService } from 'src/app/services/user.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User as AuthUser } from '@angular/fire/auth'


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage implements OnInit {

  name: string = ''
  email: string = ''
  password: string = ''
  image: string = ''

  constructor(
    private authService: AuthService,
    public userService: UserService,
    private router: Router,
    private firestorage: FireStorageService,
    private utils: UtilsService
  ) {
    const win: any = window
    win[this.constructor.name] = this
  }

  async ngOnInit() {
    // this.name = 'Danny'
    // this.email = 'danny@gmail.com'
    // this.password = '123456'
  }

  async register() {
    if (this.name === '') return this.emptyNameError()

    const pw = this.utils.promiseWrapper

    const [, error]: [UserCredential, FirebaseError] = await pw(this.authService.register(this.email, this.password))

    if (error) {
      const message = error.message.replace('Firebase:', '').replace(`(${error.code})`, '')
      this.accountError(`${message}<br>${error.code}`)
      return
    }

    if (this.image === this.userService.loadingImage) this.image = ''

    const currentUser: AuthUser = await this.authService.getCurrentAuthUser()

    const {uid} = currentUser
    const user = {id: uid, name: this.name, image: this.image} as User
    this.userService.addUser(user)

    await this.accountCreatedSuccessfuly()

    this.router.navigateByUrl('/main')
  }

  async handleImageFile() {
    const file = await this.utils.requestFile() as File

    this.image = this.userService.loadingImage

    this.firestorage.uploadFile(file, 'images', `${file.name} - ${Date.now()}`)
    .then(imageURL => this.image = imageURL)
  }

  // async handleImageFile(event: Event) {
  //   const target = event.target as HTMLIonInputElement
  //   const input = target.firstChild as HTMLInputElement
  //   const [file] = input.files

  //   this.image = 'assets/images/loading.gif'

  //   this.firestorage.uploadFile(file, 'images', `${file.name} - ${Date.now()}`)
  //   .then(imageURL => this.image = imageURL)
  // }


  // Alerts

  async accountCreatedSuccessfuly() {
    await this.utils.alert({
      header: 'Register',
      subHeader: `Account created successfuly`,
      message: 'You can go now to the main page.',
      buttons: ['Ok']
    })
  }

  async emptyNameError() {
    await this.utils.alert({
      header: 'Empty Name',
      subHeader: `We couldn't create your account`,
      message: 'A name must be provided.',
      buttons: ['Ok']
    })
  }

  async accountError(message: string) {
    await this.utils.alert({
      header: 'Error',
      subHeader: `We couldn't create your account`,
      message,
      buttons: ['Ok']
    })
  }

}
