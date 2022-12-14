import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {}

  goToRegister() {
    this.router.navigateByUrl('/register')
  }

  goToLogin() {
    this.router.navigateByUrl('/login')
  }

}
