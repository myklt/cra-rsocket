import RSocketCore from "rsocket-core";
import RSocketFlowable from "rsocket-flowable";
import RSocketWebSocketServer from "rsocket-websocket-server";

const {
  RSocketServer,
  BufferEncoders,
  decodeSimpleAuthPayload,
  MESSAGE_RSOCKET_AUTHENTICATION,
  SIMPLE,
  decodeAuthMetadata,
  CompositeMetadata,
  JsonSerializer,
  IdentitySerializers,
} = RSocketCore;
const { every, Single } = RSocketFlowable;
const RSocketWebSocketServerTransport = RSocketWebSocketServer.default;

const host = "127.0.0.1";
const port = 7000;

const transport = new RSocketWebSocketServerTransport(
  { host, port },
  BufferEncoders
);

const serializers = {
  data: {
    deserialize: JsonSerializer.deserialize,
    serialize: (data) => Buffer.from(JSON.stringify(data) || ""),
  },
  metadata: IdentitySerializers.metadata,
};

const server = new RSocketServer({
  transport,
  serializers,
  getRequestHandler: (_, setupPayload) => {
    const decodedMetadata = new CompositeMetadata(setupPayload.metadata);

    for (const metadataEntry of decodedMetadata) {
      if (metadataEntry.mimeType === MESSAGE_RSOCKET_AUTHENTICATION.string) {
        const authMetadata = decodeAuthMetadata(metadataEntry.content);

        if (authMetadata.type.string === SIMPLE.string) {
          const usernameAndPassword = decodeSimpleAuthPayload(
            authMetadata.payload
          );

          if (
            usernameAndPassword.username.toString() === "user" &&
            usernameAndPassword.password.toString() === "pass"
          ) {
            return {
              requestResponse: (payload) => Single.of(payload),
              requestStream: (payload) => {
                console.log(
                  `Received Payload(data : ${
                    payload.data ? payload.data.toString() : ""
                  }; metadata : ${
                    payload.metadata ? payload.metadata.toString() : ""
                  }`
                );
                return every(1000).map((tick) => ({
                  data: { any: tick },
                  metadata: Buffer.from([tick]),
                }));
              },
            };
          }
        }
      }
    }

    throw new Error("Unauthorized Access");
  },
});

server.start();
