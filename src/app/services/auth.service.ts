import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';

import {
  Auth,
  deleteUser,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
  User as AuthUser,
  UserCredential
} from '@angular/fire/auth';

import { UtilsService } from './utils.service'

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  dataOptions = {idField: 'id'}

  currentUser: AuthUser

  constructor(private auth: Auth, private utils: UtilsService) {
    this.auth.onAuthStateChanged(authUser => this.currentUser = authUser)
  }

  getCurrentAuthUser(): Promise<AuthUser> {
    return new Promise(resolve => {
      this.auth.onAuthStateChanged(() => resolve(this.auth.currentUser))
    })
  }

  logout() {
    signOut(this.auth)
  }

  async login(email: string, password: string): Promise<UserCredential> {
    const pw = this.utils.promiseWrapper

    const [userCredential, error]: [UserCredential, FirebaseError] = await pw(signInWithEmailAndPassword(this.auth, email, password))

    if (error) throw error

    return userCredential
  }

  async register(email: string, password: string): Promise<UserCredential> {
    const pw = this.utils.promiseWrapper

    const [userCredential, error]: [UserCredential, FirebaseError] = await pw(createUserWithEmailAndPassword(this.auth, email, password))

    if (error) throw error

    return userCredential
  }

  removeUser() {
    return deleteUser(this.currentUser)
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email)
  }

}
