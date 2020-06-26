#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { DataIngestStack } = require('../lib/data_ingest-stack');

const app = new cdk.App();
new DataIngestStack(app, 'DataIngestStack');
