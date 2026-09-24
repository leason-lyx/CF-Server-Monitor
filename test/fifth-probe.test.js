import assert from 'node:assert/strict';
import test from 'node:test';
import { Miniflare } from 'miniflare';
import { initDatabase, saveMetricsHistory } from '../src/database/schema.js';
import { mergeMetricsIntoServer } from '../src/utils/metrics.js';

test('ninth target persists independently and stays disabled for old agents', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("OK")}}', d1Databases: { DB: 'ninth-probe' } });
  try {
    const db = await mf.getD1Database('DB');
    await initDatabase(db);
    const now = Date.now();
    await saveMetricsHistory(db, 'ipv6', 1, { ping_node_4: 166, loss_node_4: 33, ping_node_5: 158, loss_node_5: 0 }, '', now, 'custom');
    const row = await db.prepare('SELECT ping_node_4, loss_node_4, ping_node_5, loss_node_5 FROM metrics_history WHERE server_id = ?').bind('ipv6').first();
    assert.deepEqual(row, { ping_node_4: 166, loss_node_4: 33, ping_node_5: 158, loss_node_5: 0 });
    await saveMetricsHistory(db, 'ipv4', 2, {}, '', now, '1.0.16');
    const disabled = await db.prepare('SELECT ping_node_5, loss_node_5 FROM metrics_history WHERE server_id = ?').bind('ipv4').first();
    assert.deepEqual(disabled, { ping_node_5: 'false', loss_node_5: 'false' });
    const live = {};
    mergeMetricsIntoServer(live, {});
    assert.equal(live.ping_node_5, false);
    assert.equal(live.loss_node_5, false);
  } finally { await mf.dispose(); }
});
