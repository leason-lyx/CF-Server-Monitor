import assert from 'node:assert/strict';
import test from 'node:test';
import { Miniflare } from 'miniflare';
import { initDatabase, saveMetricsHistory } from '../src/database/schema.js';
import { mergeMetricsIntoServer } from '../src/utils/metrics.js';

test('extra targets persist independently and stays disabled for old agents', async () => {
  const mf = new Miniflare({ modules: true, script: 'export default {fetch(){return new Response("OK")}}', d1Databases: { DB: 'extra-probes' } });
  try {
    const db = await mf.getD1Database('DB');
    await initDatabase(db);
    const now = Date.now();
    await saveMetricsHistory(db, 'ipv6', 1, { ping_node_4: 166, loss_node_4: 33, ping_node_5: 158, loss_node_5: 0, ping_node_6: 154, loss_node_6: 0, ping_node_7: 155, loss_node_7: 33, ping_node_8: null, loss_node_8: 100 }, '', now, 'custom');
    const row = await db.prepare('SELECT ping_node_4, loss_node_4, ping_node_5, loss_node_5, ping_node_6, loss_node_6, ping_node_7, loss_node_7, ping_node_8, loss_node_8 FROM metrics_history WHERE server_id = ?').bind('ipv6').first();
    assert.deepEqual(row, { ping_node_4: 166, loss_node_4: 33, ping_node_5: 158, loss_node_5: 0, ping_node_6: 154, loss_node_6: 0, ping_node_7: 155, loss_node_7: 33, ping_node_8: null, loss_node_8: 100 });
    await saveMetricsHistory(db, 'ipv4', 2, {}, '', now, '1.0.16');
    const disabled = await db.prepare('SELECT ping_node_5, loss_node_5, ping_node_6, loss_node_6, ping_node_7, loss_node_7, ping_node_8, loss_node_8 FROM metrics_history WHERE server_id = ?').bind('ipv4').first();
    assert.deepEqual(disabled, { ping_node_5: 'false', loss_node_5: 'false', ping_node_6: 'false', loss_node_6: 'false', ping_node_7: 'false', loss_node_7: 'false', ping_node_8: 'false', loss_node_8: 'false' });
    const live = {};
    mergeMetricsIntoServer(live, {});
    assert.equal(live.ping_node_5, false);
    assert.equal(live.loss_node_5, false);
    for (const n of [6, 7, 8]) { assert.equal(live[`ping_node_${n}`], false); assert.equal(live[`loss_node_${n}`], false); }
  } finally { await mf.dispose(); }
});
