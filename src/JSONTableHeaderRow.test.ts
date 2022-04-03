import {
  JSONTableHeaderRow,
  DynamicHeaderObjectCell,
} from "./JSONTableHeaderRow";
import test from "ava";

type MyHeaderObjectCell = DynamicHeaderObjectCell & {
  uno: number;
};

test("empty table header", (t) => {
  const tableHeader = new JSONTableHeaderRow([]);
  t.is(tableHeader.length, 0);
  t.deepEqual(tableHeader.columnNames, []);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), []);
});

test("table header 1", (t) => {
  const tableHeader = new JSONTableHeaderRow(["firstName"]);
  t.is(tableHeader.length, 1);
  t.deepEqual(tableHeader.columnNames, ["firstName"]);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), [0]);
  t.deepEqual(tableHeader.indicesForColumnName("lastName"), []);
});

test("table header 2", (t) => {
  const tableHeader = new JSONTableHeaderRow(["firstName", "lastName"]);
  t.is(tableHeader.length, 2);
  t.deepEqual(tableHeader.columnNames, ["firstName", "lastName"]);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), [0]);
  t.deepEqual(tableHeader.indicesForColumnName("lastName"), [1]);
});

test("table header 2 typed header cell metadata", (t) => {
  const tableHeader = new JSONTableHeaderRow<MyHeaderObjectCell>([
    "firstName",
    { name: "lastName", uno: 1 },
  ]);
  t.is(tableHeader.length, 2);
  t.deepEqual(tableHeader.columnNames, ["firstName", "lastName"]);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), [0]);
  t.deepEqual(tableHeader.indicesForColumnName("lastName"), [1]);
});

test("table header 2 typed header row", (t) => {
  const tableHeader = new JSONTableHeaderRow<
    DynamicHeaderObjectCell,
    [string, MyHeaderObjectCell]
  >(["firstName", { name: "lastName", uno: 1 }]);
  t.is(tableHeader.length, 2);
  t.deepEqual(tableHeader.columnNames, ["firstName", "lastName"]);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), [0]);
  t.deepEqual(tableHeader.indicesForColumnName("lastName"), [1]);
});

test("table header 2 named", (t) => {
  const tableHeader = new JSONTableHeaderRow([
    "firstName",
    { name: "lastName", meta: "data", type: "string | null" },
  ]);
  t.is(tableHeader.length, 2);
  t.deepEqual(tableHeader.columnNames, ["firstName", "lastName"]);
  t.deepEqual(tableHeader.indicesForColumnName("firstName"), [0]);
  t.deepEqual(tableHeader.indicesForColumnName("lastName"), [1]);
});
