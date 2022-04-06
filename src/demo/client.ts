import { JSONTable } from "../JSONTable";
import {
  JSONTableWriter,
  JSONTableWriterEvent,
  JSONTableWriterState,
} from "../JSONTableWriter";

const gDecoder = new TextDecoder();

document
  .querySelector("button")!
  .addEventListener("click", handleReadStreamClick);

async function handleReadStreamClick() {
  const table = new JSONTable<[string, string]>();
  const tableWriter = new JSONTableWriter(table);
  tableWriter.addWriteEventListeners(onDataRows);

  const url = new URL(window.location.href);
  url.pathname = "read-stream";
  url.search = new URLSearchParams({
    count: (document.querySelector("#count")! as HTMLInputElement).value,
    interval: (document.querySelector("#interval")! as HTMLInputElement).value,
  }).toString();
  const response = await fetch(url.toString());
  const reader = response.body!.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    tableWriter.write(value);
  }
  tableWriter.end(undefined);

  function onDataRows(evt: JSONTableWriterEvent) {
    console.log({ evt });

    for (const rowItr of evt.debugWrittenHeaderAndDataRows()) {
      const tbody = document.querySelector("table")!;
      const template = document.querySelector("#row")! as HTMLTemplateElement;
      const clone = template.content.cloneNode(true) as HTMLElement;
      const td = clone.querySelectorAll("td");
      td[0].textContent = rowItr[0] as string;
      td[1].textContent = rowItr[1] as string;
      tbody.appendChild(clone);
    }

    if (evt.type === JSONTableWriterState.DATA_ROWS_ENDED) {
      console.log("Response fully received");
    }
  }
}
