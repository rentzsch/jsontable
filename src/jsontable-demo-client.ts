const gDecoder = new TextDecoder();

document
  .querySelector("button")!
  .addEventListener("click", handleReadStreamClick);

async function handleReadStreamClick() {
  const url = new URL(window.location.href);
  url.pathname = "read-stream";
  url.search = new URLSearchParams({
    count: ((document.querySelector("#count")!) as HTMLInputElement).value,
    interval: ((document.querySelector("#interval")!) as HTMLInputElement).value,
  }).toString();
  const response = await fetch(url.toString());
  const reader = response.body!.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const rows = gDecoder
      .decode(value)
      .split("\n")
      .filter((line) => line.length)
      .map((line) => JSON.parse(line));

    const tbody = document.querySelector("tbody")!;
    const template = document.querySelector('#row')! as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as HTMLElement;
    const td = clone.querySelectorAll("td");
    td[0].textContent = "1235646565";
    td[1].textContent = "Stuff";
    tbody.appendChild(clone);
  }

  console.log("Response fully received");
}
