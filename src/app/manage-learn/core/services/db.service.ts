import { Injectable } from '@angular/core';
import { AppGlobalService } from '@app/services';
import PouchDB from 'pouchdb';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import PouchDBFind from 'pouchdb-find';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  pdb: any;
  isDbInitialized:boolean = false;

  constructor(private appGlobalService: AppGlobalService) {
  }

  createDb() {
    return new Promise(async(resolve, reject) => {
      if(this.isDbInitialized){
        resolve(true)
      } else {
        PouchDB.plugin(cordovaSqlitePlugin);
        PouchDB.plugin(PouchDBFind);
        const db = await new PouchDB('projects', {
          adapter: 'cordova-sqlite',
          location: 'default',
        });
        const dbInfo = await db.info()
        let oldData;
        if (dbInfo.doc_count) {
          oldData = await db.find({
            selector: {_id:{$ne:null}},
          });
    
          await db.destroy()
    
          oldData.docs= oldData.docs.map(d => {
            delete d._rev
            return d
          })
        }
        this.appGlobalService.getActiveProfileUid().then((userId) => {
          let dbName= userId + 'projects';
          this.pdb = new PouchDB(dbName, {
            adapter: 'cordova-sqlite',
            location: 'default',
          });
        }).then(res => {
          if (oldData && oldData.docs && oldData.docs.length) {
            this.bulkCreate(oldData.docs)
          }
          this.isDbInitialized = true;
          resolve(true)
        })
      }
    })
  }

  createPouchDB(dbName: string) {

  }

  create(entry: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.post(entry).then(success => {
            success.ok ? resolve(success) : reject()
          }).catch(error => {
            reject(error)
          })
        }
      })
    })
  }

  update(data): Promise<any> {
    delete data.__v;
    data.updatedAt = new Date();
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.put(data).then(success => {
            console.log(success, "success in update");
            success.ok ? resolve(success) : reject()
          }).catch(error => {
            console.log(error, "error in update");
            reject(error)
          })
        }
      })
    })
  }

  delete(id, rev): Promise<any> {
    const obj = {
      _id: id,
      _rev: rev
    }
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.remove(id, rev).then(success => {
            success.ok ? resolve(success) : reject()
          }).catch(error => {
            reject(error)
          })
        }
      })
    })
  }

  read(limit: number = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
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
        }
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
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.find({
            selector: selector,
            limit: limit
          }).then(success => {
            console.log(success, 'success of query')
            resolve(success);
          }).catch(error => {
            reject(error)
          })
        }
      })
    })
  }

  customQuery(query) {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.find(query).then(success => {
            console.log(success, 'success of query')
            resolve(success);
          }).catch(error => {
            reject(error)
          })
        }
      })
    })
  }


  dropDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.destroy().then(success => {
            success.ok ? resolve(success) : reject()
          })
        }
      })
    })
  }

  getById(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.get(id).then(success => {
            resolve(success);
          }).catch(error => {
            reject(error)
          })
        }
      })
    })
  }

  getAllDocs(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.createDb().then(isInitialized => {
        if(isInitialized) {
          this.pdb.allDocs({ include_docs: true })
        .then(docs => {
          console.log(docs,"docs rrr");
          resolve(docs);
        }).catch(error => {
          reject(error);
        })
        }
      })
    })
  }
}