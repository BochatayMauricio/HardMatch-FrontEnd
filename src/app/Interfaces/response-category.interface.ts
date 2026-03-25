export interface ResponseCategory<T> {
  success: boolean;
  data: T;
  message?: string;
}
