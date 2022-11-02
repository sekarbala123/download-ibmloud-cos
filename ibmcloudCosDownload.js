const IBM = require('ibm-cos-sdk');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const { exit } = require('process');

const myArgs = process.argv.slice(2);
if(!myArgs[0]){
    console.log("setting credentails to default: local")
    var env = "local";
}else{
    var env = myArgs[0];
}
var credFile = `./cred.${env}.json`
if(!fs.existsSync(credFile)){
    console.log(`Credentails config file not found ${credFile}`);
    exit(1);
}
const cred = require(`${credFile}`);


var config = {
    endpoint: cred.endpoints,
    apiKeyId: cred.apikey,
    serviceInstanceId: cred.resource_instance_id,
    signatureVersion: 'iam',
};

var cos = new IBM.S3(config);
var startTime = Date.now();
// Most of functions calls run-async even though promise are
// returned, this allows parallel download of files
getBuckets();

function getBuckets() {
    console.log('Retrieving list of buckets');
    return cos.listBuckets()
    .promise()
    .then(async (data) => {
        if (data.Buckets != null) {
            for (var i = 0; i < data.Buckets.length; i++) {
                var bucketName=data.Buckets[i].Name;
                console.log(`Bucket Name: ${bucketName}`);
                getBucketContents(bucketName).catch(e =>{
                    console.error(`ERROR: ${e.code} - ${e.message}\n`);        
                });
            }
        }
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message} \n`);
    });
}

function getBucketContents(bucketName) {
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    return cos.listObjects(
        {Bucket: bucketName},
    ).promise()
    .then(async (data) => {
        if (data != null && data.Contents != null) {
            for (var i = 0; i < data.Contents.length; i++) {
                var itemKey = data.Contents[i].Key;
                var itemSize = data.Contents[i].Size;
                console.log(`Item: ${itemKey} (${itemSize} bytes).`)
                getItem(bucketName, itemKey).catch(e =>{
                    console.error(`ERROR: ${e.code} - ${e.message}\n`);        
                });
            }
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

function getItem(bucketName, itemName) {
    console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
    return cos.getObject({
        Bucket: bucketName, 
        Key: itemName
    }).promise()
    .then(async (data) => {
        if (data != null) {
            createfile(bucketName, itemName,data.Body ).catch(e =>{
                console.error(`ERROR: ${e.code} - ${e.message}\n`);        
            });
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

// createfile("Test", "test", Buffer.from("tesdfst"));

function createfile(bucketName, itemName,data){
    return new Promise( (resolve, reject)=>{
        try{
            var fileName = `output/${env}/${bucketName}/${itemName}`;
            var dirPath = path.dirname(fileName);
            shell.mkdir("-p", dirPath);
            fs.writeFileSync(`${fileName}`, data);
            resolve();
        }catch(e){
            reject(e);
        }
    });
    
}
