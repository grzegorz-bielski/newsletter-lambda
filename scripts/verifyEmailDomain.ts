import * as AWS from 'aws-sdk';

import { domain } from '../src';

(async () => {
  AWS.config.update({ region: 'eu-central-1' });

  const route53 = new AWS.Route53();
  const ses = new AWS.SES();

  const token = await ses
    .verifyDomainIdentity({ Domain: domain })
    .promise()
    .then(r => r.VerificationToken);

  const hostedZone = await route53
    .listHostedZonesByName()
    .promise()
    .then(
      r =>
        r.HostedZones.find(z => z.Name.startsWith(domain)) ?? Promise.reject(new Error('No zone')),
    );

  await route53
    .changeResourceRecordSets({
      HostedZoneId: hostedZone.Id,
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT',
            ResourceRecordSet: {
              Name: `_amazonses.${domain}`,
              Type: 'TXT',
              TTL: 1800,
              ResourceRecords: [
                {
                  Value: `"${token}"`,
                },
              ],
            },
          },
        ],
      },
    })
    .promise();
})();
