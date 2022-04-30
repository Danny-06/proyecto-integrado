import { Component, OnInit } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { AuthService } from 'src/app/services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
})
export class RecoverPasswordPage implements OnInit {

  email: string = ''

  constructor(
    private authService: AuthService,
    private utils: UtilsService
  ) {}

  ngOnInit() {}

  restorePassword() {
    if (this.email === '') return this.emptyEmailAlert()

    this.authService.resetPassword(this.email)
    .then(() => this.resetPasswordSuccessAlert())
    .catch((error: FirebaseError) => {
      const message = error.message.replace('Firebase:', '').replace(`(${error.code})`, '')
      this.resetPasswordFailedAlert(`${message}<br>${error.code}`)
    })
  }

  emptyEmailAlert() {
    return this.utils.alert({
      header: 'Email Error',
      message: 'Email cannot be empty',
      buttons: ['Ok']
    })
  }

  resetPasswordSuccessAlert() {
    return this.utils.alert({
      header: 'Email sent',
      message: 'Check the email you received to restore your password',
      buttons: ['Ok']
    })
  }

  resetPasswordFailedAlert(message: string) {
    return this.utils.alert({
      header: 'Something went wrong',
      message,
      buttons: ['Ok']
    })
  }

}
