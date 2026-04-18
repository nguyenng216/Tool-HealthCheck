declare module 'net-snmp' {
  export const Version1: number;
  export const Version2c: number;
  export const Version3: number;

  export type Varbind = {
    oid: string;
    value: any;
  };

  export type SessionGetCallback = (error: Error | null, varbinds: Varbind[]) => void;
  export type SessionWalkCallback = (varbinds: Varbind[]) => void;
  export type SessionDoneCallback = (error: Error | null) => void;

  export interface Session {
    get(oids: string[], callback: SessionGetCallback): void;
    walk(oid: string, maxRepetitions: number, feedCb: SessionWalkCallback, doneCb: SessionDoneCallback): void;
    close(): void;
  }

  export function createSession(target: string, community: string, options?: Record<string, any>): Session;
  export function isVarbindError(varbind: Varbind): boolean;
  export function varbindError(varbind: Varbind): string;
}
