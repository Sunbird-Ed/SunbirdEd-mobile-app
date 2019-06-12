// @ts-ignore
interface HttpResponse {
  status: number;
  headers: any;
  url: string;
  data?: any;
  error?: string;
}

interface Cordova {
  plugin: {
    http: {
      setDataSerializer: (string) => void;
      setHeader: (host: string, header: string, value: string) => void;
      get: (url: string, parameters: any, headers: { [key: string]: string },
            successCallback: (response: HttpResponse) => void,
            errorCallback: (response: HttpResponse) => void) => void;
      patch: (url: string, data: any, headers: { [key: string]: string },
              successCallback: (response: HttpResponse) => void,
              errorCallback: (response: HttpResponse) => void) => void;
      post: (url: string, data: any, headers: { [key: string]: string },
             successCallback: (response: HttpResponse) => void,
             errorCallback: (response: HttpResponse) => void) => void;
    }
  };
}
