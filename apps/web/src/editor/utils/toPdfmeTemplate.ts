import type { Template, Schema } from '@pdfme/common';
import type {
  EditorNode,
  ContainerNode,
  TextNode,
  ImageNode,
  TableNode,
  PageDimensions,
} from '@/editor/types';

/** Accumulate absolute page coordinates by walking the parent chain. */
function getAbsolutePos(
  node: EditorNode,
  nodesMap: Map<string, EditorNode>
): { x: number; y: number } {
  if (node.parentId === null) {
    return { x: node.x, y: node.y };
  }

  const parent = nodesMap.get(node.parentId);
  if (!parent) {
    return { x: node.x, y: node.y };
  }

  const parentAbs = getAbsolutePos(parent, nodesMap);
  // node.x/y are relative to parent's content box.
  // Yoga accounts for padding when computing child positions, so we only add the
  // parent's absolute position (no extra padding offset needed here).
  return {
    x: parentAbs.x + node.x,
    y: parentAbs.y + node.y,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfmeSchema = Schema & Record<string, any>;

function visitNode(id: string, nodesMap: Map<string, EditorNode>, out: PdfmeSchema[]): void {
  const node = nodesMap.get(id);
  if (!node) {
    return;
  }

  const abs = getAbsolutePos(node, nodesMap);

  if (node.kind === 'text') {
    const n = node as TextNode;
    out.push({
      name: n.name,
      type: 'text',
      position: { x: abs.x, y: abs.y },
      width: n.width,
      height: n.height,
      content: n.content,
      rotate: n.rotate,
      opacity: n.opacity,
      fontSize: n.fontSize,
      fontName: n.fontName,
      alignment: n.alignment,
      verticalAlignment: n.verticalAlignment,
      fontColor: n.fontColor,
      backgroundColor: n.backgroundColor === 'transparent' ? '' : n.backgroundColor,
      lineHeight: n.lineHeight,
      characterSpacing: n.characterSpacing,
    });
    return;
  }

  if (node.kind === 'image') {
    const n = node as ImageNode;
    out.push({
      name: n.name,
      type: 'image',
      position: { x: abs.x, y: abs.y },
      width: n.width,
      height: n.height,
      content: n.content,
      rotate: n.rotate,
      opacity: n.opacity,
    });
    return;
  }

  if (node.kind === 'table') {
    const n = node as TableNode;
    out.push({
      name: n.name,
      type: 'table',
      position: { x: abs.x, y: abs.y },
      width: n.width,
      height: n.height,
      content: n.content,
      showHead: true,
      head: n.head,
      headWidthPercentages: n.headWidthPercentages,
    });
    return;
  }

  if (node.kind === 'container') {
    const n = node as ContainerNode;
    // Render background as a rectangle schema if not transparent
    if (n.backgroundColor && n.backgroundColor !== 'transparent') {
      out.push({
        name: `${n.name}__bg`,
        type: 'rectangle',
        position: { x: abs.x, y: abs.y },
        width: n.width,
        height: n.height,
        color: n.backgroundColor,
        borderWidth: n.borderWidth,
        borderColor: n.borderColor,
        rotate: n.rotate,
        opacity: n.opacity,
      });
    }
    // Recurse into children
    for (const childId of n.childIds) {
      visitNode(childId, nodesMap, out);
    }
  }
}

export function flattenToSchemas(nodes: Map<string, EditorNode>, rootIds: string[]): PdfmeSchema[] {
  const out: PdfmeSchema[] = [];
  for (const id of rootIds) {
    visitNode(id, nodes, out);
  }
  return out;
}

export function buildPdfmeTemplate(
  nodes: Map<string, EditorNode>,
  rootIds: string[],
  page: PageDimensions
): Template {
  const schemas = flattenToSchemas(nodes, rootIds);
  return {
    basePdf: {
      width: page.width,
      height: page.height,
      padding: page.padding,
    },
    schemas: [schemas],
  };
}

export function buildInputs(schemas: PdfmeSchema[]): Record<string, string>[] {
  return [Object.fromEntries(schemas.map((s) => [s.name, String(s.content ?? '')]))];
}
