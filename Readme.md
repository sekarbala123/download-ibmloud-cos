# Pre-requsite
* Nodejs runtime installed

### Steps
1. Install package dependencies for the first time
```npm install ```
2. Download the COS bucket credentails from the IBMCloud COS.
Save it in a file name `cred-<env>.json`
3. Update the endpoint attribute in the credentails json with the desired
 public access endpoint. Eg au-syd public endpoint "endpoints": "https://s3.au-syd.cloud-object-storage.appdomain.cloud",
4. To run the program, open command terminal in this directory
``` npm start <env>```
5. After the program execution, all COS files would be downloaded in the ```output/<env>``` directory

### Note:

* Provided sample.cred.env.json - for reference 
