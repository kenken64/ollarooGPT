declare global {
    var mongoose: {
      Types: any;
      conn: any | null;
      promise: Promise<any> | null;
    };
  }
  
  export {};