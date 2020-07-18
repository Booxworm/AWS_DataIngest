const cdk = require('@aws-cdk/core');
const iam = require('@aws-cdk/aws-iam');
const s3 = require('@aws-cdk/aws-s3');
const s3_notif = require('@aws-cdk/aws-s3-notifications');
const lambda = require('@aws-cdk/aws-lambda');
const logs = require('@aws-cdk/aws-logs');
const dynamodb = require('@aws-cdk/aws-dynamodb');

class DataIngestStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const inputBucket = new s3.Bucket(this, 'InputBucket', {
      removalPolicy : cdk.RemovalPolicy.DESTROY
    });

    const storageBucket = new s3.Bucket(this, 'StorageBucket', {
      removalPolicy : cdk.RemovalPolicy.DESTROY
    });

    const table = new dynamodb.Table(this, 'MyTable', {
      partitionKey : { name : 'id', type : dynamodb.AttributeType.STRING },

      removalPolicy : cdk.RemovalPolicy.DESTROY,
      billingMode : dynamodb.BillingMode.PAY_PER_REQUEST
    });

    const policy = new iam.PolicyStatement({
      effect : iam.Effect.ALLOW,
      resources : [
        'arn:aws:logs:'+props.env.region+':'+props.env.account+':log-group:/aws/lambda/*',
        table.tableArn,
        inputBucket.bucketArn + '/*',
        storageBucket.bucketArn + '/*'
      ],
      actions : [
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:CreateLogGroup',

        'dynamodb:PutItem',

        's3:GetObject',
        's3:PutObject'
      ]
    });

    const role = new iam.Role(this, 'FnRole', {
      assumedBy : new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    role.addToPolicy(policy);

    const fileFn = new lambda.Function(this, 'FileFunction', {
      runtime : lambda.Runtime.NODEJS_12_X,
      code : lambda.Code.asset('lambda'),
      handler : 'files.handler',

      role : role,

      logRetention: logs.RetentionDays.ONE_DAY,
      environment : {
        TABLE_NAME : table.tableName,
        INPUT_BUCKET_NAME : inputBucket.bucketName,
        STORAGE_BUCKET_NAME : storageBucket.bucketName
      }
    });

    inputBucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT, new s3_notif.LambdaDestination(fileFn));
  }
}

module.exports = { DataIngestStack }
