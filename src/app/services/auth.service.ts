import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';

import {
  Auth,
  deleteUser,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
  User as AuthUser,
  UserCredential, getAuth
} from '@angular/fire/auth';

import { UtilsService } from './utils.service'

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  dataOptions = {idField: 'id'}

  constructor(private auth: Auth, private utils: UtilsService) {}

  getCurrentUser(): AuthUser {
    return getAuth().currentUser
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
    deleteUser(this.getCurrentUser())
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email)
  }

}
