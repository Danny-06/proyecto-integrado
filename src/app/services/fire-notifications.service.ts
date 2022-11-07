import { Injectable } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { getMessaging, getToken, onMessage, Messaging, GetTokenOptions, MessagePayload, NextFn, Observer, Unsubscribe } from "firebase/messaging";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

// https://medium.com/@jishnusaha89/firebase-cloud-messaging-push-notifications-with-angular-1fb7f173bfba

export class FireNotificationsService {

  private messaging: Messaging = getMessaging()

  async requestPermission() {
    const {vapidKey} = environment.firebase
    const [currentToken, permissionError] = await this.getToken(this.messaging, {vapidKey})

    if (permissionError) {
      throw permissionError
    }

    return currentToken
  }

  getToken(messaging: Messaging, options: GetTokenOptions): Promise<[string, FirebaseError]> {
    return getToken(messaging, options)
    .then(
      value  => [value, null],
      reason => [null, reason]
    )
  }

  listen(nextOrObserver: NextFn<MessagePayload> | Observer<MessagePayload>): Unsubscribe {
    const unsubscribe = onMessage(this.messaging, nextOrObserver)

    return unsubscribe
  }

}
