// lib/localLedger/MerkleDAG.ts

export type LedgerNode = {
  txHash: string;
  fromPubkey: string;
  toPubkey: string;
  amount: number;
  parentHashes: string[];
  timestamp: number;
  synced: boolean;
  syncing?: boolean;
};

export class MerkleDAG {
  private nodes: Map<string, LedgerNode> = new Map();

  constructor(initialNodes: LedgerNode[] = []) {
    initialNodes.forEach((n) => {
      this.nodes.set(n.txHash, n);
    });
  }

  addNode(node: LedgerNode) {
    // Dedup
    if (this.nodes.has(node.txHash)) return;

    // Genesis rule
    if (node.parentHashes.length === 0) {
      if (this.nodes.size !== 0) {
        throw new Error("Genesis node already exists");
      }
    } else {
      for (const parent of node.parentHashes) {
        if (!this.nodes.has(parent)) {
          throw new Error(`Missing parent ${parent}`);
        }
      }
    }

    this.nodes.set(node.txHash, node);
  }

  getNode(hash: string): LedgerNode | undefined {
    return this.nodes.get(hash);
  }

  getAllNodes(): LedgerNode[] {
    return Array.from(this.nodes.values());
  }

  getTips(): LedgerNode[] {
    const referenced = new Set<string>();

    this.nodes.forEach((n) =>
      n.parentHashes.forEach((p: string) => referenced.add(p))
    );

    return Array.from(this.nodes.values()).filter(
      (n) => !referenced.has(n.txHash)
    );
  }

  getUnsyncedNodes(): LedgerNode[] {
    return this.getAllNodes().filter((n) => !n.synced && !n.syncing);
  }

  markSyncing(txHash: string) {
    const node = this.nodes.get(txHash);
    if (!node) return;
    node.syncing = true;
    this.nodes.set(txHash, node);
  }

  markSynced(txHash: string) {
    const node = this.nodes.get(txHash);
    if (!node) return;
    node.synced = true;
    node.syncing = false;
    this.nodes.set(txHash, node);
  }
}
