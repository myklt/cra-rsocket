import logo from "./logo.svg";
import "./App.css";
import { useEffect } from "react";
import { createClient, createMetadata } from "./SocketClient";

const maxRSocketRequestN = 2147483647;

function App() {
  useEffect(() => {
    createClient()
      .connect()
      .then(
        (socket) => {
          socket
            .connectionStatus()
            .subscribe((event) => console.log("connectionStatus", event));

          socket
            .requestResponse({
              data: { any: "any" },
              metadata: createMetadata(),
            })
            .subscribe({
              onComplete: (payload) => {
                console.log("Request-response completed", payload);
              },
              onError: (error) => {
                console.error(`Request-response error:${error.message}`);
              },
            });

          socket
            .requestStream({
              data: {},
              metadata: createMetadata(),
            })
            .subscribe({
              onComplete: () => console.log("Request-stream completed"),
              onError: (error) => {
                console.error(`Request-stream error:${error.message}`);
              },
              onNext: (payload) => {
                console.log("Request-stream next: ", payload);
              },
              onSubscribe: (sub) => sub.request(maxRSocketRequestN),
            });
        },
        (error) => {
          console.log("error:", error);
        }
      );
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
