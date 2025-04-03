import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { FilePaths } from './file';

@Injectable({
  providedIn: 'root'
})
export class FilePathService {

  constructor(private platform: Platform) { }

  async getFilePath(directory: FilePaths): Promise<string> {
    let dir: Directory;

    switch (directory) {
      case FilePaths.CACHE:
        dir = Directory.Cache;
        break;
      case FilePaths.DATA:
        dir = Directory.Data;
        break;
      case FilePaths.DOCUMENTS:
        dir = Directory.Documents;
        break;
  
    
        case FilePaths.EXTERNAL_DATA:
        dir = Directory.External;
        break;
        case FilePaths.EXTERNAL_STORAGE:
          dir = Directory.ExternalStorage;
          break;
      default:
        throw new Error('Unsupported directory');
    }

    const folderPath = await Filesystem.getUri({ path: '', directory: dir })


     return folderPath.uri + "/";
  }

  async readFile(filepath) {

    const contents = await Filesystem.readFile({
      path: filepath,
    });
    console.log('File contents:', contents);
    return contents;


  };

  async isFileExists(filepath: string) {
    try {
      await Filesystem.stat({
          path: filepath
      });
      return true;
  } catch {
      return false;
  }
  }
}
