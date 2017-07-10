export interface KeepassAssociation {
  key: string;
  id: string;
  hash: string;
}

export interface KeepassCredentials {
  uuid: string,
  login: string,
  password: string
}

export interface Keepass {
  getDatabaseHash(): Promise<string>;
  getCredentials(origin: string, formUrl: string): Promise<KeepassCredentials[]>;
  associate(): Promise<KeepassAssociation>;
  isAssociated(dbHash: string): Promise<boolean>;
}