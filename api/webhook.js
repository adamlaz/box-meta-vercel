const Box = require('box-node-sdk');

export default async function webhook(request, response) {
  console.log('Webhook triggered'); // Test log

  let isValid = Box.validateWebhookMessage(request.body, request.headers, process.env.primaryKey, process.env.secondaryKey);

  if (isValid) {
    console.log('Webhook is valid'); // Log validation success

    // Configure SDK with environment variables
    const config = {
      boxAppSettings: {
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        appAuth: {
          keyID: process.env.publicKeyID,
          privateKey: process.env.privateKey,
          passphrase: process.env.passphrase
        }
      },
      enterpriseID: process.env.enterpriseID
    };

    const sdk = Box.getPreconfiguredInstance(config);
    const client = sdk.getAppAuthClient('enterprise', process.env.enterpriseID);

    try {
      console.log('Request Body:', request.body); // Log the entire request body
      const fileId = request.body.source.id;
      console.log('File ID:', fileId); // Log the file ID

      // Apply metadata template to the file
      const metadataTemplate = 'authorizingDocument';
      const metadataBody = {
        test1: 'asdf',
        test2: '1234'
      };

      const metadataResponse = await client.files.addMetadata(fileId, client.metadata.scopes.ENTERPRISE, metadataTemplate, metadataBody);
      console.log('Metadata Response:', metadataResponse); // Log the response

      response.status(200).json({ info: 'success' });
    } catch (error) {
      console.error('Error applying metadata:', error);
      response.status(200).json({ info: 'Error', error: error.toString() });
    }
  } else {
    console.error('Invalid webhook message');
    response.status(200).json({ info: 'Invalid webhook message' });
  }
}
