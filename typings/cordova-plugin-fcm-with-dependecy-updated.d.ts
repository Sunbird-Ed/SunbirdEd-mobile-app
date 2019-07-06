declare var FCMPlugin: {
    onNotification: ( callback: (data: any) => void, success: (sucess: object) => void,
    error: (err: string) => void) => void;

    getToken: (sucess: (token: string) => void, error?: (error: string) => void) => void;

    onTokenRefresh: (sucess: (token: string) => void, error?: (error: string) => void) => void;
}
