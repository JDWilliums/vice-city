declare global {
  interface Window {
    crumbless: { track: (eventName: string) => void };
  }
}

export {};
