export interface PublicPromise<T> extends Promise<T> {
  resolve(value?: T): void
  reject(reason?: any): void
}
