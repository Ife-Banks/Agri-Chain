import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class PinGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const pin = request.headers['x-pin'];
    if (!pin || typeof pin !== 'string' || pin.length !== 4) {
      throw new UnauthorizedException('Valid 4-digit PIN required in X-PIN header');
    }
    request.pin = pin;
    return true;
  }
}
