const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const DataIngest = require('../lib/data_ingest-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new DataIngest.DataIngestStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
