export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type JustifyContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch';
export type FlexWrap = 'no-wrap' | 'wrap' | 'wrap-reverse';

export interface PageDimensions {
  width: number; // mm
  height: number; // mm
  padding: [number, number, number, number]; // top right bottom left
}

export interface BaseNode {
  id: string;
  name: string;
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  opacity?: number;
  flexGrow?: number;
  flexShrink?: number;
}

export interface TextNode extends BaseNode {
  kind: 'text';
  content: string;
  fontSize: number;
  fontName?: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment: 'top' | 'middle' | 'bottom';
  fontColor: string;
  backgroundColor: string;
  lineHeight: number;
  characterSpacing: number;
}

export interface ImageNode extends BaseNode {
  kind: 'image';
  content: string;
}

export interface TableNode extends BaseNode {
  kind: 'table';
  content: string;
  head: string[];
  headWidthPercentages: number[];
}

export interface ContainerNode extends BaseNode {
  kind: 'container';
  childIds: string[];
  flexDirection: FlexDirection;
  justifyContent: JustifyContent;
  alignItems: AlignItems;
  flexWrap: FlexWrap;
  gap: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

export type EditorNode = TextNode | ImageNode | TableNode | ContainerNode;
export type NodeKind = EditorNode['kind'];
