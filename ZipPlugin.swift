//
//  JJzipPlugin.swift
//
//
//  Created by Pace Wisdom on 01/07/21.
//
import Foundation
import FiNeZeep
import SSZipArchive


@objc(FiNeZeep) class FiNeZeep : CDVPlugin {

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
