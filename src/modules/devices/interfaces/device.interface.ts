export interface Device {
  id: number;
  name: string;
  ip: string;
  type: string;
  credentialEncrypted?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
