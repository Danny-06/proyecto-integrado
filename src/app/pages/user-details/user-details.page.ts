import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  async ionViewWillEnter() {
    this.user = await this.userService.getUser()

    if (!this.user) {
      await this.userService.handleUserDoesNotExists()
      return
    }

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

    this.userService.updateUser(this.user)
  }

}
