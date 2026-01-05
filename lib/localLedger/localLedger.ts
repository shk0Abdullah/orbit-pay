// core/ledger/LocalLedger.ts
import * as SecureStore from "expo-secure-store";
import { LedgerNode, MerkleDAG } from "./MerkleDAG";

const STORAGE_KEY = "LEDGER_DAG";

export class LocalLedger {
  private dag: MerkleDAG;

  private constructor(nodes: LedgerNode[]) {
    this.dag = new MerkleDAG(nodes);
  }

  /** Factory because SecureStore is async */
  static async create() {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    const nodes: LedgerNode[] = raw ? JSON.parse(raw) : [];
    return new LocalLedger(nodes);
  }

  private async persist() {
    await SecureStore.setItemAsync(
      STORAGE_KEY,
      JSON.stringify(this.dag.getAllNodes())
    );
  }

  async addTransaction(node: LedgerNode) {
    this.dag.addNode(node);
    await this.persist();
  }

  getTips() {
    return this.dag.getTips();
  }

  /**
   * Sync local DAG to Convex
   * Pass the ACTION FUNCTION, not the hook
   */
  async sync(
    createLedgerTx: (args: {
      fromPubkey: string;
      toPubkey: string;
      amount: number;
      parentHashes: string[];
      signature: string;
    }) => Promise<any>
  ) {
    const unsynced = this.dag.getUnsyncedNodes();

    for (const node of unsynced) {
      try {
        // 🚧 mark inflight
        this.dag.markSyncing(node.txHash);
        await this.persist();

        await createLedgerTx({
          fromPubkey: node.fromPubkey,
          toPubkey: node.toPubkey,
          amount: node.amount,
          parentHashes: node.parentHashes,
          signature: "offline-simulated-signature",
        });

        // ✅ success
        this.dag.markSynced(node.txHash);
        await this.persist();
      } catch (err) {
        console.warn("Sync failed for", node.txHash, err);
        node.syncing = false;
        await this.persist();
      }
    }
  }
}
