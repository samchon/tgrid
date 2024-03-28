export class ErrorService {
  public generate(): void {
    throw new TypeError("Something is wrong");
  }
}
