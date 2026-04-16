import { ref } from 'vue';
import {
  FlexDirection as YogaFlexDir,
  Justify,
  Align,
  Wrap,
  Edge,
  Gutter,
  Direction,
} from 'yoga-layout';
import type { Node as YogaNode } from 'yoga-layout';
import type { ContainerNode } from '@/editor/types';
import { useEditorStore } from '@/stores/editor';

// --- Enum mappings ---

const flexDirMap: Record<string, YogaFlexDir> = {
  row: YogaFlexDir.Row,
  column: YogaFlexDir.Column,
  'row-reverse': YogaFlexDir.RowReverse,
  'column-reverse': YogaFlexDir.ColumnReverse,
};

const justifyMap: Record<string, Justify> = {
  'flex-start': Justify.FlexStart,
  center: Justify.Center,
  'flex-end': Justify.FlexEnd,
  'space-between': Justify.SpaceBetween,
  'space-around': Justify.SpaceAround,
  'space-evenly': Justify.SpaceEvenly,
};

const alignMap: Record<string, Align> = {
  'flex-start': Align.FlexStart,
  center: Align.Center,
  'flex-end': Align.FlexEnd,
  stretch: Align.Stretch,
  baseline: Align.Baseline,
};

const wrapMap: Record<string, Wrap> = {
  'no-wrap': Wrap.NoWrap,
  wrap: Wrap.Wrap,
  'wrap-reverse': Wrap.WrapReverse,
};

// --- Singleton state ---
// yoga-layout uses top-level await internally, so the default export is the
// ready Yoga instance once the module resolves. We import it lazily so the
// app can still boot if WASM loading is delayed.

let yoga: Awaited<typeof import('yoga-layout')> | null = null;
const yogaReady = ref(false);

async function initYoga(): Promise<void> {
  if (yoga) {
    return;
  }
  yoga = await import('yoga-layout');
  yogaReady.value = true;
}

// --- Layout calculation ---

function calculateContainerLayout(
  container: ContainerNode,
  children: { id: string; width: number; height: number; flexGrow?: number; flexShrink?: number }[]
): { id: string; x: number; y: number; width: number; height: number }[] {
  if (!yoga) {
    return [];
  }

  const { Node } = yoga.default;

  const root: YogaNode = Node.create();
  root.setWidth(container.width);
  root.setHeight(container.height);
  root.setFlexDirection(flexDirMap[container.flexDirection] ?? YogaFlexDir.Row);
  root.setJustifyContent(justifyMap[container.justifyContent] ?? Justify.FlexStart);
  root.setAlignItems(alignMap[container.alignItems] ?? Align.FlexStart);
  root.setFlexWrap(wrapMap[container.flexWrap] ?? Wrap.NoWrap);
  root.setGap(Gutter.All, container.gap);
  root.setPadding(Edge.Top, container.paddingTop);
  root.setPadding(Edge.Right, container.paddingRight);
  root.setPadding(Edge.Bottom, container.paddingBottom);
  root.setPadding(Edge.Left, container.paddingLeft);

  const isRow = container.flexDirection === 'row' || container.flexDirection === 'row-reverse';
  const stretches = container.alignItems === 'stretch';

  const yogaChildren: YogaNode[] = children.map((child, i) => {
    const yc = Node.create();
    const grows = (child.flexGrow ?? 0) > 0;

    if (grows) {
      // flex-basis: 0 so flex-grow controls the full proportion of space, not just the remainder.
      yc.setFlexBasis(0);
      yc.setFlexGrow(child.flexGrow!);
    } else {
      // Set main-axis size from the stored value.
      if (isRow) {
        yc.setWidth(child.width);
      } else {
        yc.setHeight(child.height);
      }
    }

    // Cross-axis: only set when NOT stretching — stretch requires leaving it unset so Yoga
    // can fill the container's cross-axis dimension.
    if (!stretches) {
      if (isRow) {
        yc.setHeight(child.height);
      } else {
        yc.setWidth(child.width);
      }
    }

    if (child.flexShrink !== undefined) {
      yc.setFlexShrink(child.flexShrink);
    }
    root.insertChild(yc, i);
    return yc;
  });

  root.calculateLayout(container.width, container.height, Direction.LTR);

  const results: { id: string; x: number; y: number; width: number; height: number }[] =
    children.map((child, i) => {
      const yc = yogaChildren[i]!;
      return {
        id: child.id,
        x: yc.getComputedLeft(),
        y: yc.getComputedTop(),
        width: yc.getComputedWidth(),
        height: yc.getComputedHeight(),
      };
    });

  // Free all Yoga nodes
  for (const yc of yogaChildren) {
    root.removeChild(yc);
    yc.free();
  }
  root.free();

  return results;
}

/**
 * Walk all containers BFS top-down (parents before children so nested
 * containers see their parent's updated size).
 */
function recalculateAll(): void {
  const store = useEditorStore();
  if (!yoga) {
    return;
  }

  const allResults: { id: string; x: number; y: number; width: number; height: number }[] = [];

  const queue: string[] = [...store.rootIds];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = store.getNode(id);
    if (!node || node.kind !== 'container') {
      continue;
    }

    const container = node as ContainerNode;
    const children = store.getChildren(container.id).map((c) => ({
      id: c.id,
      width: c.width,
      height: c.height,
      flexGrow: c.flexGrow,
      flexShrink: c.flexShrink,
    }));

    const results = calculateContainerLayout(container, children);
    allResults.push(...results);

    // Queue child containers to process after their parent
    for (const childId of container.childIds) {
      const child = store.getNode(childId);
      if (child?.kind === 'container') {
        queue.push(childId);
      }
    }
  }

  store.applyLayoutResults(allResults);
}

export function useYogaLayout() {
  return { initYoga, yogaReady, recalculateAll };
}
