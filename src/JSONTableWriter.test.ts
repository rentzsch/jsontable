import { JSONTable } from "./JSONTable";
import {
  JSONTableWriter,
  JSONTableWriterState,
  JSONTableWriterEvent,
} from "./JSONTableWriter";
import test from "ava";

test("states", (t) => {
  const tbl = new JSONTable();
  const writer = new JSONTableWriter(tbl);
  t.is(writer.state, JSONTableWriterState.AWAITING_FIRST_LINE);
  writer.write(JSON.stringify(["firstName"]) + "\n");
  t.is(writer.state, JSONTableWriterState.HEADER_ROW_WRITTEN);
  writer.end(JSON.stringify(["Homer"]) + "\n");
  t.is(writer.state, JSONTableWriterState.DATA_ROWS_ENDED);
  t.is(tbl.headerRow.length, 1);
  t.is(tbl.headerRow.headerRow[0], "firstName");
  t.is(tbl.dataRows.length, 1);
  t.is(tbl.dataRows[0].length, 1);
  t.is(tbl.dataRows[0][0], "Homer");
});

test("events", (t) => {
  let HEADER_ROW_WRITTEN = 0;
  let DATA_ROWS_WRITTEN = 0;
  let DATA_ROWS_ENDED = 0;

  const writer = new JSONTableWriter(null);

  writer.addEventListener(JSONTableWriterState.AWAITING_FIRST_LINE, () => {
    t.fail("JSONTableWriterState.AWAITING_FIRST_LINE is never dispatched");
  });
  writer.addEventListener(JSONTableWriterState.HEADER_ROW_WRITTEN, (evt) => {
    const writerEvt = evt as JSONTableWriterEvent;
    t.deepEqual(writerEvt.writtenHeaderRow, ["firstName"]);
    t.deepEqual(writerEvt.writtenDataRows, []);
    HEADER_ROW_WRITTEN++;
  });
  writer.addEventListener(JSONTableWriterState.DATA_ROWS_WRITTEN, (evt) => {
    const writerEvt = evt as JSONTableWriterEvent;
    t.deepEqual(writerEvt.writtenHeaderRow, null);
    t.deepEqual(writerEvt.writtenDataRows, [["Homer"]]);
    DATA_ROWS_WRITTEN++;
  });
  writer.addEventListener(JSONTableWriterState.DATA_ROWS_ENDED, (evt) => {
    const writerEvt = evt as JSONTableWriterEvent;
    t.deepEqual(writerEvt.writtenHeaderRow, null);
    t.deepEqual(writerEvt.writtenDataRows, [["Marge"], ["Bart"]]);
    DATA_ROWS_ENDED++;
  });

  t.is(HEADER_ROW_WRITTEN, 0);
  t.is(DATA_ROWS_WRITTEN, 0);
  t.is(DATA_ROWS_ENDED, 0);

  writer.write(JSON.stringify(["firstName"]) + "\n");
  t.is(HEADER_ROW_WRITTEN, 1);
  t.is(DATA_ROWS_WRITTEN, 0);
  t.is(DATA_ROWS_ENDED, 0);

  writer.write(JSON.stringify(["Homer"]) + "\n");
  t.is(HEADER_ROW_WRITTEN, 1);
  t.is(DATA_ROWS_WRITTEN, 1);
  t.is(DATA_ROWS_ENDED, 0);

  writer.end(`["Marge"]
["Bart"]
`);
  t.is(HEADER_ROW_WRITTEN, 1);
  t.is(DATA_ROWS_WRITTEN, 1);
  t.is(DATA_ROWS_ENDED, 1);
});

test("single end write", (t) => {
  const tbl = new JSONTable();
  const writer = new JSONTableWriter(tbl);
  writer.end(`["firstName"]
["Homer"]
["Marge"]
`);
  t.is(tbl.headerRow.length, 1);
  t.is(tbl.headerRow.headerRow[0], "firstName");
  t.is(tbl.dataRows.length, 2);
  t.is(tbl.dataRows[0].length, 1);
  t.is(tbl.dataRows[0][0], "Homer");
  t.is(tbl.dataRows[1][0], "Marge");
});

test("double end exception", (t) => {
  const writer = new JSONTableWriter(new JSONTable());
  writer.end(`["firstName"]
["Homer"]
`);
  const err = t.throws(
    () => {
      writer.end(JSON.stringify(["Marge"]) + "\n");
    },
    { instanceOf: Error }
  );
});
