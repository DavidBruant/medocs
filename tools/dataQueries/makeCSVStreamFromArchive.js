import {createGunzip} from 'zlib'
import {join, extname} from 'path'
import {createReadStream} from 'fs'

import {Parse} from 'unzip-stream'
import csv from 'csv-parser'


export default function(file){

    const extension = extname(file);
    const fileStream = createReadStream(file)

    return new Promise((resolve) => {
        if(extension === '.zip'){
            fileStream
            .pipe(Parse())
            .on('entry', entry => {
                //console.log('entry', entry.path, entry.type)
                resolve(entry.pipe(csv({separator: ';'})))
            })
        }
        else{
            resolve(
                fileStream
                .pipe(createGunzip())
                .pipe(csv({separator: ';'}))
            )
        }
    })    
}