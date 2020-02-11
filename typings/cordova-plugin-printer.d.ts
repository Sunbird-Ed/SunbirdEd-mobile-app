interface CordovaPlugins {
    printer: {
        print: (url: string) => void;
        canPrintItem: (url: string, callback: (canPrint: boolean) => void) => void;
    };
}
