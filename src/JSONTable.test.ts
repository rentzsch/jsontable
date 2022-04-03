import { JSONTableHeaderRow } from "./JSONTableHeaderRow";
import { JSONTable } from "./JSONTable";
import test from "ava";
import { DynamicHeaderObjectCell } from "./JSONTableHeaderRow";

test("empty dynamic table", (t) => {
  const tbl = new JSONTable();
  t.is(tbl.headerRow.length, 0);
  t.is(tbl.dataRows.length, 0);
});

test("dynamic table with header row", (t) => {
  const tbl = new JSONTable({
    headerRow: new JSONTableHeaderRow(["firstName"]),
  });
  t.is(tbl.headerRow.length, 1);
  t.is(tbl.dataRows.length, 0);
});

test("dynamic table with row", (t) => {
  const tbl = new JSONTable({
    headerRow: new JSONTableHeaderRow(["firstName"]),
  });
  t.is(tbl.headerRow.length, 1);
  tbl.dataRows.push(["Homer"]);
  t.is(tbl.dataRows.length, 1);
});

test("typed table with header and row", (t) => {
  const tbl = new JSONTable<[string, string]>({
    headerRow: new JSONTableHeaderRow<
      DynamicHeaderObjectCell,
      [string, string]
    >(["firstName", "lastName"]),
  });
  t.is(tbl.headerRow.length, 2);
  tbl.dataRows.push(["Homer", "Simpson"]);
  t.is(tbl.dataRows.length, 1);
});
