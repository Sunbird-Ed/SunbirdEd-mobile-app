import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import PouchDBFind from 'pouchdb-find';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  pdb: any;

  constructor() {
    PouchDB.plugin(cordovaSqlitePlugin);
    PouchDB.plugin(PouchDBFind);
    this.pdb = new PouchDB('projects',
      {
        adapter: 'cordova-sqlite',
        location: 'default',
      });

  }

  createPouchDB(dbName: string) {

  }

  create(entry: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pdb.post(entry).then(success => {
        success.ok ? resolve(success) : reject()
      }).catch(error => {
        reject(error)
      })
    })
    // return this.pdb.post(entry);
  }

  update(data): Promise<any> {
    delete data.__v;
    data.updatedAt = new Date();
    return new Promise((resolve, reject) => {
      this.pdb.put(data).then(success => {
        console.log(success, "success in update");
        success.ok ? resolve(success) : reject()
      }).catch(error => {
        console.log(error, "error in update");
        reject(error)
      })
    })
  }

  delete(id, rev): Promise<any> {
    const obj = {
      _id: id,
      _rev: rev
    }
    return new Promise((resolve, reject) => {
      this.pdb.remove(id, rev).then(success => {
        success.ok ? resolve(success) : reject()
      }).catch(error => {
        reject(error)
      })
    })
    // return this.pdb.post(entry);
  }

  read(limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pdb.allDocs({ include_docs: true, limit: limit })
        .then(docs => {
          let data = [];
          docs.rows.forEach(element => {
            data.push(element.doc)
          });
          resolve(data);
        }).catch(error => {
          reject(error);
        })
    })
  }

  bulkCreate(data): Promise<any> {
    const entries = this.formatDataForBulkCreate(data);
    return new Promise((resolve, reject) => {
      this.pdb.bulkDocs(entries).then(success => {
        // success.ok ? resolve(success) : reject()
        resolve(success);
      }).catch(error => {
        reject()
      })
    })
  }

  formatDataForBulkCreate(data) {
    for (const item of data) {
      delete item.__v
    }
    return data
  }


  // update(): Promise<any> {
  //   return new Promise((resolve, reject) => {

  //   })
  // }

  // delete() : Promise<any> {
  //   return new Promise((resolve, reject) => {

  //   })
  // }

  query(selector: any, limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pdb.find({
        selector: selector,
        limit: limit
      }).then(success => {
        console.log(success, 'success of query')
        resolve(success);
      }).catch(error => {
        reject(error)
      })
    })
  }

  customQuery(query) {
    return new Promise((resolve, reject) => {
      this.pdb.find(query).then(success => {
        console.log(success, 'success of query')
        resolve(success);
      }).catch(error => {
        reject(error)
      })
    })
  }


  dropDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pdb.destroy().then(success => {
        success.ok ? resolve(success) : reject()
      }).catch(error => {
      })
    })
  }

  getById(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pdb.get(id).then(success => {
        resolve(success);
      }).catch(error => {
      })
    })
  }
}