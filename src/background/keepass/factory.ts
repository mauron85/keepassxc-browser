import KeepassHttp from './KeepassHttp';
import * as keepassNaCl from './keepassNaCl';

export const NATIVE_CLIENT = 'nacl';
export const HTTP_CLIENT = 'http';

export default function getKeepassInstance(type: string) {
  switch (type) {
    case NATIVE_CLIENT:
      return keepassNaCl;
    case HTTP_CLIENT:
      return new KeepassHttp();
    default:
      return null;
  }
}
