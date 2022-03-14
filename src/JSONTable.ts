import { JsonObject, JsonValue } from "type-fest";
import { WritableStream } from "node:stream/web";

export class JSONTable<
  RowType extends DynamicRow = DynamicRow,
  HeaderRowType extends DynamicHeaderRow = DynamicHeaderRow
> {
  protected _state: JSONTableState;
  protected _rows: RowType[];
  protected _columnIdxByName: Map<string, number> | null;

  constructor(args: JSONTableCtr = {}) {
    this._state = JSONTableState.NO_DATA;
    this._rows = [];
    this._columnIdxByName = null;
  }

  get state() {
    return this._state;
  }

  //-------------------------------------------------------------------
  // Loading

  loadHeaderRow(headerRow: HeaderRowType) {
    if (this._state !== JSONTableState.NO_DATA) {
      throw new Error(
        `Attempting to load header rows in incorrect state ${this._state}`
      );
    }
    (this._rows as Object[]).push(headerRow);
    this._state = JSONTableState.HEADER_ROW_LOADED;
  }

  loadRow(row: RowType) {
    if (this._state !== JSONTableState.HEADER_ROW_LOADED) {
      throw new Error(
        `Attempting to load rows in incorrect state ${this._state}`
      );
    }
    this._rows.push(row);
    this._state = JSONTableState.ROWS_LOADING;
  }

  completeLoadingRows() {
    this._state = JSONTableState.ROWS_COMPLETE;
  }

  //-------------------------------------------------------------------
  // Access

  columnNames() {
    return this._columnIdxByName
      ? Array.from(this._columnIdxByName.keys())
      : null;
  }

  rowAtIdx(rowIdx: number) {
    return this._rows[rowIdx + 1];
  }

  cellAtCoordinates(coordinates: JSONTableCoordinates) {
    const row = this.rowAtIdx(coordinates.rowIdx);
    return (row as any)[coordinates.columnIdx];
  }

  cellAtColumnName(rowIdx: number, columnName: keyof RowType) {
    const row = this.rowAtIdx(rowIdx);
    this._columnIdxByName!.get(columnName as string);
  }

  //-------------------------------------------------------------------
  //

  static async fromString<
    RowType extends DynamicRow = DynamicRow,
    HeaderRowType extends DynamicHeaderRow = DynamicHeaderRow
  >(ndjson: string) {
    const table = new JSONTable<RowType, HeaderRowType>();
    const writableTable = createJSONTableWritableStream(table);
    await writableTable.getWriter().write(new TextEncoder().encode(ndjson));
    await writableTable.close();
    return table;
  }

  //-------------------------------------------------------------------
  // Internal implementation

  protected processRow(row: RowType) {}
}

//--
// Types

type NDJSONHeaderRowType = NDJSONHeaderCellType[];
type NDJSONHeaderCellType =
  | string
  | {
      name: string;
    };
type NDJSONDataRowType = NDJSONDataCellType[];
type NDJSONDataCellType = JsonValue;

//--
//

export type DynamicHeaderCell =
  | string
  | {
      name: string;
    };
export type DynamicHeaderRow = DynamicHeaderCell[];

export type DynamicRow = {
  [key: string]: JsonValue;
};
export type JSONTableCtr = {};

export type JSONTableCoordinates = {
  rowIdx: number;
  columnIdx: number;
};

export enum JSONTableState {
  NO_DATA = "NO_DATA",
  HEADER_ROW_LOADED = "HEADER_ROW_LOADED",
  ROWS_LOADING = "ROWS_LOADING",
  ROWS_COMPLETE = "ROWS_COMPLETE",
}

export function isValidHeaderRow() {}
export function isValidDataRow() {}

//---------------------------------------------------------------------
// WritableStream

export function createJSONTableWritableStream<
  RowType extends DynamicRow,
  HeaderRowType extends DynamicHeaderRow
>(table: JSONTable<RowType, HeaderRowType>) {
  let decoder = new TextDecoder();
  let writesBuffer = "";
  return new WritableStream<Uint8Array>({
    async write(chunk) {
      writesBuffer += decoder.decode(chunk, { stream: true });
      if (writesBuffer.length > 0) {
        for (;;) {
          const nlIdx = writesBuffer.indexOf("\n");
          if (nlIdx === -1) {
            break;
          } else {
            const firstLineStr = writesBuffer.substring(0, nlIdx);
            writesBuffer = writesBuffer.substring(nlIdx + 1);

            const firstLineJson = JSON.parse(firstLineStr);
            if (!Array.isArray(firstLineJson)) {
              throw new Error(``);
            }
            if (table.state === JSONTableState.NO_DATA) {
              table.loadHeaderRow(firstLineJson as HeaderRowType);
            } else {
              // @ts-expect-error
              table.loadRow(firstLineJson as RowType);
            }
          }
        }
      }
    },
    async close() {
      table.completeLoadingRows();
    },
    async abort() {
      table.completeLoadingRows();
    },
  });
}

//---------------------------------------------------------------------
// ReadableStream<string> implementation

// TODO
