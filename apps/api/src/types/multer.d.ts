declare module 'multer' {
  interface Options {
    storage?: unknown;
    limits?: { fileSize?: number };
  }
  function memoryStorage(): unknown;
  export { memoryStorage, Options };
}