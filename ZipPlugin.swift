//
//  JJzipPlugin.swift
//
//
//  Created by Pace Wisdom on 01/07/21.
//
//
//  JJzipPlugin.swift
//
//
//  Created by Pace Wisdom on 01/07/21.
//
import Foundation
import SSZipArchive


// ZipPlugin class.
@objc(JJzipPlugin) class JJzipPlugin : CDVPlugin {

func path(forURL urlString: String?) -> String? {
    // Attempt to use the File plugin to resolve the destination argument to a
    // file path.
    var path: String? = nil
    let filePlugin = commandDelegate.getCommandInstance("File")
    if let filePlugin = filePlugin {
        let url = CDVFilesystemURL.fileSystemURL(with: urlString)
        path = filePlugin.filesystemPath(for: url)
    }
    // If that didn't work for any reason, assume file: URL.
    if path == nil {
        if urlString?.hasPrefix("file:") ?? false {
            path = URL(string: urlString ?? "")?.path
        }
    }
    return path
}
//Zip Method.
 @objc func zip(_ command: CDVInvokedUrlCommand?) {
 var pluginResult: CDVPluginResult = CDVPluginResult.init(status: CDVCommandStatus_ERROR)
        let directoriesToBeSkipped = command.arguments[0] as? String
        let filesToBeSkipped = command.arguments[1] as? [String]
        pluginResult = CDVPluginResult.init(status: CDVCommandStatus_OK, messageAs: results)
        self.commandDelegate.send(pluginResult, callbackId: command.callbackId)
    
}


//unzip Method.
@objc func unzip(_ command: CDVInvokedUrlCommand?) {
    var pluginResult: CDVPluginResult? = nil
    SwiftTryCatch.try({
        let fromPath = path(forURL: command?.arguments[0])
        let toPath = path(forURL: command?.arguments[1])
        var error: Error?

        if SSZipArchive.unzipFile(atPath: fromPath, toDestination: toPath, overwrite: true, password: nil, error: &error, delegate: self) {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_OK)
        } else {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAs: error?.localizedDescription)
        }
    }, catch: { exception in
        pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAsString: exception.reason())
    }, finallyBlock: {
        commandDelegate.send(pluginResult, callbackId: command?.callbackId)
    })
}


// jsevent method.
func jsEvent(_ event: String?, _ data: String?) {
    var eventStrig = "cordova.fireDocumentEvent('\(event ?? "")'"
    // NSString *eventStrig = [NSString stringWithFormat:@"console.log('%@'", event];
    if let data = data {
        eventStrig = "\(eventStrig),\(data)"
    }
    eventStrig = eventStrig + ");"
   commandDelegate.evalJs(eventStrig)
}

// dic method.
func dictionary(toJSONString toCast: [AnyHashable : Any]?) -> String? {
    var error: Error?
    var jsonData: Data? = nil
    do {
        if let toCast = toCast {
            jsonData = try JSONSerialization.data(withJSONObject: toCast, options: .prettyPrinted)
        }
    } catch {
    }
    if jsonData == nil {
        return nil
    } else {
        if let jsonData = jsonData {
            return String(data: jsonData, encoding: .utf8)
        }
        return nil
    }
}



}
