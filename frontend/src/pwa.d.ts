declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare module 'workbox-window' {
  export class Workbox {
    constructor(scriptURL: string, registerOptions?: any);
    register(): Promise<ServiceWorkerRegistration | undefined>;
    addEventListener(type: string, listener: (event: any) => void): void;
    messageSW(data: any): Promise<any>;
  }
}
