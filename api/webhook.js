const Box = require('box-node-sdk');

export default async function webhook(request, response) {
  // Validate that Box is the service calling the webhook.
  let isValid = Box.validateWebhookMessage(request.body, request.headers, process.env.primaryKey, process.env.secondaryKey);

  if (isValid) {
    const sdkConfig = {
      boxAppSettings: {
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret
      },
      enterpriseID: process.env.enterpriseID
    };
    const sdk = Box.getPreconfiguredInstance(sdkConfig);
    const client = sdk.getAppAuthClient('enterprise', process.env.enterpriseID);

    try {
      const fileId = request.body.source.id;

      // Apply metadata template to the file
      const metadataTemplate = 'authorizingDocument';
      const metadataBody = {
        test1: 'asdf',
        test2: '1234'
      };

      await client.files.addMetadata(fileId, client.metadata.scopes.ENTERPRISE, metadataTemplate, metadataBody);

      // Success response
      response.status(200).json({ info: 'success' });
    } catch (error) {
      console.error('Error applying metadata:', error);
      // Error response
      response.status(200).json({ info: 'Error' });
    }
  } else {
    response.status(200).json({ info: 'Invalid webhook message' });
  }
}
