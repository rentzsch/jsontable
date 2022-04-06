import { JSONTableWriter } from "./JSONTableWriter";

import crypto from "crypto";
import fs from "fs";
import http from "http";

let gReqID = 1;
http
  .createServer((req, res) => {
    const reqID = gReqID++;
    const url = new URL("http://example.com" + req.url);
    console.log(`${reqID.toString().padStart(4, "0")} => ${req.url}`);
    switch (url.pathname) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("demo-server.html"));
        break;
      case "/client.js":
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(fs.readFileSync("dist/demo-server-client-bundle.js"));
        break;
      case "/read-stream":
        handleReadStream(reqID, url.searchParams, res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(`$url Not Found`);
    }
  })
  .listen(3000);
console.log("\n*** Visit http://localhost:3000");

function handleReadStream(
  reqID: number,
  urlSearchParams: URLSearchParams,
  res: http.ServerResponse
) {
  const interval = urlSearchParams.has("interval")
    ? parseInt(urlSearchParams.get("interval")!, 10)
    : 1000;
  const count = urlSearchParams.has("count")
    ? parseInt(urlSearchParams.get("count")!, 10)
    : 10;
  let index = 1;

  res.writeHead(200, { "Content-Type": "application/nd-json" });
  res.write(JSON.stringify(["timestamp", "uuid"]) + "\n");

  // console.log("starting repeating timer", { interval, index, count });
  const timer = setInterval(() => {
    const output = JSON.stringify([
      "🧑‍💻" + new Date().toISOString(),
      crypto.randomUUID(),
    ]);
    console.log(
      `${reqID.toString().padStart(4, "0")} <= ${index} of ${count}: ${output}`
    );
    res.write(output + "\n");
    if (index >= count) {
      clearInterval(timer);
      res.end();
    }
    index++;
  }, interval);
}

function handleWriteStream(reqID: any, urlSearchParams: any, res: any) {
  // Calc tape?
  // input incoming number table
  // output number with related sum
}

// TODO websocket
