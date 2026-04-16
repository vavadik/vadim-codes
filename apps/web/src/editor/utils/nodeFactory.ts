import { nanoid } from 'nanoid';
import type {
  TextNode,
  ImageNode,
  TableNode,
  ContainerNode,
  EditorNode,
  NodeKind,
} from '@/editor/types';

export function createTextNode(overrides: Partial<TextNode> = {}): TextNode {
  return {
    id: nanoid(),
    name: `text_${nanoid(6)}`,
    parentId: null,
    x: 20,
    y: 20,
    width: 60,
    height: 15,
    kind: 'text',
    content: 'Text',
    fontSize: 12,
    alignment: 'left',
    verticalAlignment: 'top',
    fontColor: '#000000',
    backgroundColor: 'transparent',
    lineHeight: 1,
    characterSpacing: 0,
    ...overrides,
  };
}

export function createImageNode(overrides: Partial<ImageNode> = {}): ImageNode {
  return {
    id: nanoid(),
    name: `image_${nanoid(6)}`,
    parentId: null,
    x: 20,
    y: 20,
    width: 50,
    height: 40,
    kind: 'image',
    content: '',
    ...overrides,
  };
}

export function createTableNode(overrides: Partial<TableNode> = {}): TableNode {
  return {
    id: nanoid(),
    name: `table_${nanoid(6)}`,
    parentId: null,
    x: 20,
    y: 20,
    width: 100,
    height: 40,
    kind: 'table',
    content: JSON.stringify([['Cell 1', 'Cell 2']]),
    head: ['Column 1', 'Column 2'],
    headWidthPercentages: [50, 50],
    ...overrides,
  };
}

export function createContainerNode(overrides: Partial<ContainerNode> = {}): ContainerNode {
  return {
    id: nanoid(),
    name: `container_${nanoid(6)}`,
    parentId: null,
    x: 20,
    y: 20,
    width: 120,
    height: 60,
    kind: 'container',
    childIds: [],
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'no-wrap',
    gap: 4,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#94a3b8',
    ...overrides,
  };
}

const factories: Record<NodeKind, (overrides?: Partial<EditorNode>) => EditorNode> = {
  text: (o) => createTextNode(o as Partial<TextNode>),
  image: (o) => createImageNode(o as Partial<ImageNode>),
  table: (o) => createTableNode(o as Partial<TableNode>),
  container: (o) => createContainerNode(o as Partial<ContainerNode>),
};

export function createNode(kind: NodeKind, overrides?: Partial<EditorNode>): EditorNode {
  return factories[kind](overrides);
}
