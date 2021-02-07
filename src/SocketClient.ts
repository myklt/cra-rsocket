import {
  RSocketClient,
  encodeCompositeMetadata,
  TEXT_PLAIN,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
  JsonSerializer,
  IdentitySerializers,
  MESSAGE_RSOCKET_AUTHENTICATION,
  MESSAGE_RSOCKET_ROUTING,
  encodeRoute,
  encodeSimpleAuthMetadata,
  BufferEncoders,
} from "rsocket-core";
import RSocketWebSocketClient from "rsocket-websocket-client";

const keepAlive = 60000;
const lifetime = 180000;
const dataMimeType = "application/json";
const metadataMimeType = MESSAGE_RSOCKET_COMPOSITE_METADATA.string;
const route = "test.service";

export const createMetadata = () =>
  encodeCompositeMetadata([
    [TEXT_PLAIN, Buffer.from("Hello World")],
    [MESSAGE_RSOCKET_ROUTING, encodeRoute(route)],
    [MESSAGE_RSOCKET_AUTHENTICATION, encodeSimpleAuthMetadata("user", "pass")],
    ["custom/test/metadata", Buffer.from([1, 2, 3])],
  ]);

export const createClient = () => {
  const setup = {
    payload: {
      data: undefined,
      metadata: createMetadata(),
    },
    keepAlive,
    lifetime,
    dataMimeType,
    metadataMimeType,
  };

  const transport = new RSocketWebSocketClient(
    {
      debug: true,
      url: "ws://localhost:7000",
      wsCreator: (url) => new WebSocket(url),
    },
    BufferEncoders
  );

  const serializers = {
    data: {
      deserialize: JsonSerializer.deserialize,
      serialize: (data: any) => {
        return Buffer.from(JSON.stringify(data) || "");
      },
    },
    metadata: IdentitySerializers.metadata,
  };

  const client = new RSocketClient<any, Buffer>({
    setup,
    transport,
    serializers,
  });
  return client;
};
