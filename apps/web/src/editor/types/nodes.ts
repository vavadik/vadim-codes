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

/**
 * Coordinate convention:
 * - Root nodes (parentId === null): x/y are page-absolute mm coords, user-set via drag.
 * - Flex children (parentId !== null): x/y are relative to the parent container's content
 *   box origin. Written by Yoga after each layout pass. Read-only from the user's perspective.
 *
 * toPdfmeTemplate.ts accumulates the parent chain to produce page-absolute coords for export.
 */
export interface BaseNode {
  id: string;
  name: string; // used as pdfme schema name on export
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  opacity?: number;
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
  content: string; // base64 data URL
}

export interface TableNode extends BaseNode {
  kind: 'table';
  content: string; // JSON string — pdfme table row data
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
  gap: number; // mm
  paddingTop: number; // mm
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
}

export type EditorNode = TextNode | ImageNode | TableNode | ContainerNode;
export type NodeKind = EditorNode['kind'];
