import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertOptions, LoadingOptions } from '@ionic/angular';
import { Observable, Observer } from 'rxjs';


interface PublicPromise<T> extends Promise<T> {
  resolve(value?: T): void
  reject(reason?: any): void
  mixResult(): Promise<any[]>
}


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

  async showLoader(options: LoadingOptions, delay: number = null) {
    const ionLoading = document.createElement('ion-loading')
    Object.assign(ionLoading, options)
    document.body.append(ionLoading)

    let timeoutId

    if (delay === null) {
      await ionLoading.present()
    } else {
      timeoutId = setTimeout(() => ionLoading.present(), delay)
    }

    return function cancelLoader() {
      clearTimeout(timeoutId)

      ionLoading.classList.add('overlay-hidden')
      ionLoading.addEventListener('transitionend', event => ionLoading.remove())
    }
  }

  observableToPromise<T, R extends boolean = false>(observable: Observable<T>, multipleValues: R = false as R) {

    return new Promise((resolve, reject) => {

      if (!multipleValues) {
        observable.subscribe({next: resolve, error: reject})
      }

      const values: any[] = []

      const observer: Observer<any> = {
        next:     data    => values.push(data),
        error:    message => reject(message),
        complete: ()      => resolve(values)
      }

      observable.subscribe(observer)
    }) as R extends false ? Promise<T> : Promise<T[]>

  }

  /**
   * Show to the user a file picker to select a file
   */
  requestFile<R extends boolean= false>(accept: string = '*/*', multiple: R = false as R) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple

    input.click()

    return new Promise(resolve => {
      input.onchange = event => {
        if (multiple) resolve(Array.from(input.files ?? []))
        else          resolve(input.files![0])
      }
    }) as R extends false ? Promise<File> : Promise<File[]>
  }

  async alert(options: AlertOptions, timeout: null | number = null) {
    const ionAlert = document.createElement('ion-alert')
    Object.assign(ionAlert, options)
    document.body.append(ionAlert)

    ionAlert.present()

    if (typeof timeout === 'number' && !isNaN(timeout) && isFinite(timeout)) {
      setTimeout(() => ionAlert.dismiss(), timeout)
    }

    await ionAlert.onDidDismiss()
  }

  private isDateTimePickerShown = false

  async showDateTimePicker(): Promise<[Date?, Error?]> {
    if (this.isDateTimePickerShown) throw new Error(`Cannot show a datetime picker while there's still one active`)

    this.isDateTimePickerShown = true

    const overlay = document.createElement('div')
    const shadow = overlay.attachShadow({mode: 'open'})
    overlay.dataset.component = 'ion-datetime-picker'

    const style = shadow.appendChild(document.createElement('style'))
    style.innerHTML = // css
    `
    :host {
      all: revert;

      /* Custom Property dependency of the 'datetime' */
      --ion-color-base: var(--ion-color-primary, #3880ff) !important;
    }

    :host {
      position: fixed;
      inset: 0;

      display: flex;

      background-color: #0008;
    }

    ion-datetime {
      margin: auto;
      animation: grow 0.3s ease-out;
    }

    @keyframes grow {
      0% {
        transform: scale(0);
      }

      100% {
        transform: scale(1);
      }
    }
    `

    const dateTimePicker = document.createElement('ion-datetime')
    dateTimePicker.showDefaultButtons = true
    dateTimePicker.showClearButton = true

    // The component to be able to initialize must be appended to the DOM
    document.head.append(dateTimePicker)
    shadow.append(dateTimePicker)
    
    await this.delay(150)

    const confirmButton = dateTimePicker.shadowRoot.querySelector('#confirm-button')
    const clearButton   = dateTimePicker.shadowRoot.querySelector('#clear-button')
    const cancelButton  = dateTimePicker.shadowRoot.querySelector('#cancel-button')

    document.querySelector('ion-app').append(overlay)

    const result = [null, null]

    return new Promise((resolve, reject) => {
      confirmButton.addEventListener('click', async event => {
        await this.delay()

        const date = new Date(dateTimePicker.value)
        result[0] = date

        resolve(result)
      }, {once: true})

      clearButton.addEventListener('click', event => {
        resolve(result)
      }, {once: true})

      cancelButton.addEventListener('click', event => {
        const error = new Error('DateTimePicker cancelled')
        result[1] = error

        resolve(result)
      }, {once: true})
    })
    .finally(() => {
      this.isDateTimePickerShown = false
      overlay.remove()
    }) as Promise<[Date?, Error?]>
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

      mixResult() {
        const mixedPromise = this.createPublicPromise()

        this.then(
          value => mixedPromise.resolve([value, null]),
          reason => mixedPromise.resolve([null, reason])
        )

        return mixedPromise
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
