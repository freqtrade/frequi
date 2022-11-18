// TODO: This interface should really come from the grid-layout package
export interface GridItemData {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  maxH?: number;
  maxW?: number;
  minH?: number;
  minW?: number;
  moved?: boolean;
  static?: boolean;
}
