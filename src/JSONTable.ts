import {
  JSONTableHeaderRow,
  DynamicHeaderObjectCell,
} from "./JSONTableHeaderRow";
import { JsonValue } from "type-fest";

export class JSONTable<
  DataRowType = JsonValue[],
  HeaderCellType extends DynamicHeaderObjectCell = DynamicHeaderObjectCell,
  HeaderRowType = (string | HeaderCellType)[]
> {
  headerRow: JSONTableHeaderRow<HeaderCellType, HeaderRowType>;
  dataRows: DataRowType[] = [];
  constructor({
    headerRow,
  }: {
    headerRow?: JSONTableHeaderRow<HeaderCellType, HeaderRowType>;
  } = {}) {
    if (headerRow === undefined) {
      this.headerRow = new JSONTableHeaderRow<HeaderCellType, HeaderRowType>(
        [] as unknown as HeaderRowType
      );
    } else {
      this.headerRow = headerRow;
    }
  }
  rowAtIdx(rowIdx: number) {
    return this.dataRows[rowIdx];
  }
  cellAtCoordinates(coordinates: JSONTableCoordinates) {
    const row = this.rowAtIdx(coordinates.rowIdx);
    return (row as unknown as JsonValue[])[coordinates.columnIdx];
  }
  recordAtIndex(idx: number) {
    const record: DynamicRecord = {};
    const row = this.rowAtIdx(idx);
    for (const [colIdx, colName] of this.headerRow.columnNames.entries()) {
      record[colName] = (row as unknown as JsonValue[])[colIdx];
    }
    return record;
  }
}

//---------------------------------------------------------------------
// Types

export type JSONTableCoordinates = {
  rowIdx: number;
  columnIdx: number;
};

export type DynamicRecord = {
  [key: string]: JsonValue;
};
