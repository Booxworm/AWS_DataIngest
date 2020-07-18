const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const s3 = new AWS.S3();

exports.handler = function (event) {
    console.log(JSON.stringify(event, undefined, 2));

    const id = event.Records[0].userIdentity.principalId
    const file = event.Records[0].s3.object;
    console.log(id);
    console.log(file.key);
    console.log(file.size);

    const arr = file.key.split('.');
    const ext = arr[arr.length - 1];
    const filename = arr.slice(0, arr.length - 1).join('.');

    console.log(process.env.TABLE_NAME);
    const params = {
        TableName : process.env.TABLE_NAME,
        Item : {
            id : { S : id + '_' + file.key },
            size : { N : file.size.toString() },
            filename : { S : filename },
            extension : { S : ext }
        }
    }

    ddb.putItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });

    s3.getObject({
        Bucket: process.env.INPUT_BUCKET_NAME, 
        Key: file.key
    }, (err, data) => {
        if (err)
            console.log(err, err.stack);
        else {
            s3.putObject({
                Bucket : process.env.STORAGE_BUCKET_NAME,
                Key : id + '/' + file.key,
                Body : data.Body
            }, (err) => {
                if (err)
                    console.log(err, err.stack);
                else {
                    console.log('Upload success');
                }
            });
        }
    });
}