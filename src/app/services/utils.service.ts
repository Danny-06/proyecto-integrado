import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertOptions } from '@ionic/angular';
import { Observable, Observer } from 'rxjs';
import { PublicPromise } from '../interfaces/public-promise';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {

  constructor(
    private http: HttpClient
  ) {}

  async fetch(path: string, responseType: any = 'blob'): Promise<string | Blob | ArrayBuffer | object | []> {
    return this.http.get(path, {responseType}).toPromise()
  }

  promiseWrapper(promise: Promise<any>): Promise<[any, any]> {
    return new Promise(resolve => {
      promise
      .then(value => resolve([value, null]))
      .catch(reason => resolve([null, reason]))
    })
  }

  observableToPromise(observable: Observable<any>, multipleValues: boolean = false): Promise<any> {

    return new Promise((resolve, reject) => {

      if (!multipleValues) return observable.subscribe({next: resolve, error: reject})

      const values: any[] = []

      const observer: Observer<any> = {
        next:     data    => values.push(data),
        error:    message => reject(message),
        complete: ()      => resolve(values)
      }

      observable.subscribe(observer)
    })

  }

  /**
   * Show to the user a file picker to select a file
   */
  requestFile(accept: string = '*/*', multiple: boolean = false): Promise<File|File[]> {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple

    input.click()

    return new Promise(resolve => {
      input.onchange = event => {
        if (multiple) resolve([...input.files])
        else          resolve(input.files[0])
      }
    })
  }

  async alert(options: AlertOptions) {
    const ionAlert = document.createElement('ion-alert')
    Object.assign(ionAlert, options)
    document.body.append(ionAlert)

    ionAlert.present()

    await ionAlert.onDidDismiss()
  }

  createPublicPromise(): PublicPromise<any> {
    let resolve
    let reject

    const promise = new Promise((resolveFunction, rejectFunction) => {
      resolve = resolveFunction
      reject = rejectFunction
    })

    const publicPromise: PublicPromise<any> = {
      resolve,
      reject,

      then(onFulfilled?, onRejected?) {
        return promise.then(onFulfilled, onRejected)
      },
      catch(onRejected?) {
        return promise.catch(onRejected)
      },
      finally(onFinally?) {
        return promise.finally(onFinally)
      },
      [Symbol.toStringTag]: 'PublicPromise'
    }

    return publicPromise
  }

  delay(time: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  // This function allows to target the scroller of the page to style it with JS
  async getIonContentShadowRoot() {
    const routerOutlet = await this.waitForSelector('ion-router-outlet')

    await this.delay(500)

    const ionPage = await this.waitForSelector('.ion-page:not([aria-hidden], .ion-page-hidden), .ion-page.ion-page-hidden[aria-hidden] ~ .ion-page.can-go-back:not([aria-hidden])', routerOutlet)

    if (!ionPage.shadowRoot) return ionPage.querySelector('ion-content').shadowRoot

    const ionContent = await this.waitForSelector('ion-content', ionPage.shadowRoot)
    return ionContent.shadowRoot
  }

  waitForSelector(selector: string, doc: Document | DocumentFragment | Element = document): Promise<Element> {
    function checkElement(selector, resolve) {
      const element = doc.querySelector(selector)
      if (element) return resolve(element)

      requestAnimationFrame(() => checkElement(selector, resolve))
    }

    return new Promise(resolve => {
      checkElement(selector, resolve)
    })
  }


  waitForSelectorAll(selector: string, childrenNumber: number, doc: Document | DocumentFragment | Element = document) {
    if (typeof childrenNumber !== 'number' || childrenNumber <= 0) throw new TypeError('parameter 2 must be a positive number different from 0')
  
    function checkElements(selector, resolve) {
      const nodeList = doc.querySelectorAll(selector)
      if (nodeList && nodeList.length === childrenNumber) return resolve(nodeList)
  
      requestAnimationFrame(() => checkElements(selector, resolve))
    }
  
    return new Promise(resolve => {
      checkElements(selector, resolve)
    })
  }


  // Load CSS Modules
  async loadAndAttachCSSModuleToHost(host: any, cssPath: string) {
    const cssModule = await this.getCSSModule(cssPath)
    this.attatchCSSModuleToHost(host, cssModule)
  }

  attatchCSSModuleToHost(host: any, cssModule: any) {
    if (!host) return
    host.adoptedStyleSheets = [...host.adoptedStyleSheets, cssModule]
  }

  getCSSModule(path: string) {
    const stylesheet: any = new CSSStyleSheet()

    this.fetch(path, 'text')
    .then(text => stylesheet.replace(text))

    return stylesheet
  }

  textToCSSModule(cssText: string) {
    const stylesheet: any = new CSSStyleSheet()
    stylesheet.replace(cssText)

    return stylesheet
  }

}
