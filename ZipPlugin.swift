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
        // Attempt to use the File plugin to resolve the destination argument to a file path.

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

        //return

        return path
    }
}

 @objc func zip(_ command: CDVInvokedUrlCommand?) {
    var pluginResult: CDVPluginResult? = nil

    // TODO: import SwiftTryCatch from https://github.com/ypopovych/SwiftTryCatch
    SwiftTryCatch.try({
        let fromPath = path(forURL: command?.arguments[0])
        let toPath = path(forURL: command?.arguments[1])

        if SSZipArchive.createZipFile(atPath: toPath, withContentsOfDirectory: fromPath, keepParentDirectory: false, withPassword: nil) {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_OK)
        } else {
            pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAsString: "failed to zip")
        }
    }, catch: { exception in
        pluginResult = CDVPluginResult(status: CDVCommandStatus_ERROR, messageAsString: exception.reason())
    }, finallyBlock: {
        commandDelegate.send(pluginResult, callbackId: command?.callbackId)
    })
}
//unzip Method.
          @objc func unzip(_ command: CDVInvokedUrlCommand?) {
    let sourceDictionary = getSourceDictionary(command?.argument(atIndex: 0))
    let targetOptions = command?.argument(atIndex: 1)
    let targetPath = targetOptions?.value(forKey: "target")?.replacingOccurrences(of: "file://", with: "")
    let sourcePath = sourceDictionary["path"] as? String
    let sourceName = sourceDictionary["name"] as? String
    let success = SSZipArchive.unzipFile(
        atPath: (sourcePath ?? "") + (sourceName ?? ""),
        toDestination: targetPath)
    let responseObj = [
        "success": NSNumber(value: success),
        "message": "-"
    ]
    let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAsDictionary: responseObj)
    commandDelegate.send(pluginResult, callbackId: command?.callbackId)
}

// getsource method.
func getSourceDictionary(_ sourceString: String?) -> [AnyHashable : Any]? {
    let lastIndexSlash = (sourceString as NSString?)?.range(of: "/", options: .backwards).location ?? 0
    let path = (sourceString as NSString?)?.substring(with: NSRange(location: 0, length: lastIndexSlash + 1))
    let name = (sourceString as NSString?)?.substring(from: lastIndexSlash + 1)
    let sourceDictionary = [
        "path": path?.replacingOccurrences(of: "file://", with: "") ?? "",
        "name": name ?? ""
    ]
    return sourceDictionary
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



