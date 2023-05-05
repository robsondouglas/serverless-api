const { ApiGatewayManagementApiClient } = require("@aws-sdk/client-apigatewaymanagementapi");

const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });

const requestParams = {
    ConnectionId: connectionId,
    Data: "Hello!",
  };

  const cmd = new PostToConnectionCommand(requestParams);
  client.send(cmd);

  