import { JSONTable } from "./JSONTable";
import {
  JSONTableHeaderRow,
  DynamicHeaderObjectCell,
} from "./JSONTableHeaderRow";
import { JsonValue } from "type-fest";

export class JSONTableWriter<
  DataRowType = JsonValue[],
  HeaderCellType extends DynamicHeaderObjectCell = DynamicHeaderObjectCell,
  HeaderRowType = (string | HeaderCellType)[]
> extends EventTarget {
  state = JSONTableWriterState.AWAITING_FIRST_LINE;
  protected decoder = new TextDecoder();
  protected writesBuffer = "";
  protected columnCount = -1;

  constructor(
    public table: JSONTable<DataRowType, HeaderCellType, HeaderRowType> | null
  ) {
    super();
  }

  addWriteEventListeners(callback: (evt: JSONTableWriterEvent) => void) {
    for (const state of [
      JSONTableWriterState.HEADER_ROW_WRITTEN,
      JSONTableWriterState.DATA_ROWS_WRITTEN,
      JSONTableWriterState.DATA_ROWS_ENDED,
    ]) {
      this.addEventListener(state, callback as EventListener);
    }
  }

  write(chunk: string | Uint8Array) {
    if (typeof chunk === "string") {
      this.writesBuffer += chunk;
    } else {
      this.writesBuffer += this.decoder.decode(chunk, { stream: true });
    }
    this.processBuffer(false);
  }

  end(chunk: string | Uint8Array | undefined) {
    if (typeof chunk === "string") {
      this.writesBuffer += chunk;
    } else if (typeof chunk !== "undefined") {
      this.writesBuffer += this.decoder.decode(chunk);
    }
    this.processBuffer(true);
  }

  //-------------------------------------------------------------------

  protected processBuffer(end: boolean) {
    if (this.writesBuffer.length > 0) {
      const dataRows: DataRowType[] = [];
      for (;;) {
        const nlIdx = this.writesBuffer.indexOf("\n");
        if (nlIdx === -1) {
          break;
        } else {
          const firstLineStr = this.writesBuffer.substring(0, nlIdx);
          this.writesBuffer = this.writesBuffer.substring(nlIdx + 1);

          const firstLineJson = JSON.parse(firstLineStr);
          if (!Array.isArray(firstLineJson)) {
            throw new Error(`JSON line isn't expected array ${firstLineJson}`);
          }

          switch (this.state) {
            case JSONTableWriterState.AWAITING_FIRST_LINE:
              this.columnCount = firstLineJson.length;
              const headerRow = firstLineJson as unknown as HeaderRowType;
              if (this.table !== null) {
                this.table.headerRow = new JSONTableHeaderRow<
                  HeaderCellType,
                  HeaderRowType
                >(headerRow);
              }
              this.updateState(
                JSONTableWriterState.HEADER_ROW_WRITTEN,
                headerRow,
                []
              );
              break;
            case JSONTableWriterState.HEADER_ROW_WRITTEN:
            case JSONTableWriterState.DATA_ROWS_WRITTEN:
              if (firstLineJson.length !== this.columnCount) {
                throw new Error("data row length !== header row length");
              }
              const dataRow = firstLineJson as unknown as DataRowType;
              dataRows.push(dataRow);
              if (this.table !== null) {
                this.table.dataRows.push(dataRow);
              }
              break;
            case JSONTableWriterState.DATA_ROWS_ENDED:
              throw new Error("JSONTableWriter.end() called more than once");
              break;
          }
        }
      }
      if (dataRows.length > 0) {
        this.updateState(
          end
            ? JSONTableWriterState.DATA_ROWS_ENDED
            : JSONTableWriterState.DATA_ROWS_WRITTEN,
          null,
          dataRows
        );
      }
    } else {
      if (end) {
        this.updateState(JSONTableWriterState.DATA_ROWS_ENDED, null, []);
      }
    }
  }

  protected updateState(
    state: JSONTableWriterState,
    writtenHeaderRow: HeaderRowType | null,
    writtenDataRows: DataRowType[]
  ) {
    this.state = state;
    this.dispatchEvent(
      new JSONTableWriterEvent(state, this, writtenHeaderRow, writtenDataRows)
    );
  }
}

export enum JSONTableWriterState {
  AWAITING_FIRST_LINE = "AWAITING_FIRST_LINE",
  HEADER_ROW_WRITTEN = "HEADER_ROW_WRITTEN",
  DATA_ROWS_WRITTEN = "DATA_ROWS_WRITTEN",
  DATA_ROWS_ENDED = "DATA_ROWS_ENDED",
}

export class JSONTableWriterEvent<
  DataRowType = JsonValue[],
  HeaderCellType extends DynamicHeaderObjectCell = DynamicHeaderObjectCell,
  HeaderRowType = (string | HeaderCellType)[]
> extends Event {
  constructor(
    eventName: JSONTableWriterState,
    public writer: JSONTableWriter<DataRowType, HeaderCellType, HeaderRowType>,
    public writtenHeaderRow: HeaderRowType | null,
    public writtenDataRows: DataRowType[]
  ) {
    super(eventName);
  }
  /**
   * The return type on this isn't great (flattens HeaderRowType to a
   * consistent DataRowType[]), but it's useful for just jamming into
   * an HTML table row, hence the "debug" in the method name.
  */
  debugWrittenHeaderAndDataRows() {
    let rows: DataRowType[] = [];
    if (this.writtenHeaderRow !== null) {
      rows.push(this.writtenHeaderRow as unknown as DataRowType);
    }
    rows = rows.concat(this.writtenDataRows);
    return rows;
  }
}
