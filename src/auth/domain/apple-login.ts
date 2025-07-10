export class AppleLogin {
  constructor(
    public readonly appleId: string,
    public readonly phoneNumber: string = '010-5705-1328',
  ) {}

  isAppleConnect(): boolean {
    return this.appleId === 'AppleConnect';
  }
}
