import express from 'express';
import cors from 'cors';
import { qualitySummary, assertionsList, lineageGraph } from './data.js';

const app = express();
const PORT = process.env.PORT || 8006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'data-quality-contracts-lineage', timestamp: new Date().toISOString() });
});

app.get('/api/quality-summary', (req, res) => {
  res.json({
    summary: qualitySummary
  });
});

app.get('/api/assertions', (req, res) => {
  res.json({
    assertions: assertionsList,
    totalCount: assertionsList.length,
    criticalCount: assertionsList.filter(a => a.severity === 'CRITICAL').length
  });
});

app.get('/api/lineage', (req, res) => {
  res.json({
    lineage: lineageGraph
  });
});

// Schema Mutation Breaking Change Gatekeeper
app.post('/api/validate-schema-change', (req, res) => {
  const { proposedChanges } = req.body;
  // e.g. Dropping or altering nullability
  const isBreaking = proposedChanges?.some(c => c.type === 'DROP_FIELD' || (c.type === 'SET_REQUIRED' && c.required === true));

  res.json({
    isBreakingChange: !!isBreaking,
    verdict: isBreaking
      ? 'BLOCKED: Breaking contract mutation detected. Dropping non-nullable columns violates downstream SLA contracts.'
      : 'APPROVED: Backward compatible schema evolution. Changes permitted to merge into production catalog.',
    gateAction: isBreaking ? 'REJECT_PR' : 'MERGE_PERMITTED'
  });
});

app.listen(PORT, () => {
  console.log(`Data Quality & Contracts API running on port ${PORT}`);
});
