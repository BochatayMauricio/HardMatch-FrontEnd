export interface ResponseStore<T> {
  success?: boolean;
  data: T;
  message?: string;
}
