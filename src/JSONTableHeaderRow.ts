export class JSONTableHeaderRow<
  HeaderCellType extends DynamicHeaderObjectCell = DynamicHeaderObjectCell,
  HeaderRowType = (string | HeaderCellType)[]
> {
  constructor(public headerRow: HeaderRowType) {}
  get length() {
    return (this.headerRow as unknown as DynamicHeaderStringOrObjectCell[])
      .length;
  }
  get columnNames() {
    return (this.headerRow as unknown as DynamicHeaderStringOrObjectCell[]).map(
      (headerCell) =>
        typeof headerCell === "string" ? headerCell : headerCell.name
    );
  }
  indicesForColumnName(name: string) {
    const result: number[] = [];
    for (const [colIdx, colNameItr] of this.columnNames.entries()) {
      if (colNameItr === name) {
        result.push(colIdx);
      }
    }
    return result;
  }
  validateDynamicDataRow(dataRow: any) {}
}

export function validateDynamicHeaderRow(
  headerRow: DynamicHeaderStringOrObjectCell[]
) {}

export enum validateDynamicHeaderRowErrorCode {
  NoError = 0,
  NotAnArray,
  HeaderCellIsntAStringOrObject,
  HeaderCellObjectIsMissingRequiredNameField,
}

export type DynamicHeaderObjectCell = {
  name: string;
};

export type DynamicHeaderStringOrObjectCell = string | DynamicHeaderObjectCell;
