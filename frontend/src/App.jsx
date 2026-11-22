import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DataQualityScorecardView from './pages/DataQualityScorecardView';
import DataContractSpecView from './pages/DataContractSpecView';
import OpenLineageGraphView from './pages/OpenLineageGraphView';
import CreditCardDatasetView from './pages/CreditCardDatasetView';
import { fetchQualitySummary, fetchAssertions, fetchLineage } from './services/api';

const defaultSummary = {
  activeContract: 'financial.payments.transactions_bronze (v1.2.0)',
  overallHealthScore: 99.4,
  totalChecksExecuted: 142,
  passedChecks: 140,
  failedWarnings: 2,
  criticalViolations: 0,
  slaCompliancePct: 99.98,
  pipelineGateStatus: 'ALLOW_PROMOTION'
};

const defaultAssertions = [
  {
    id: 'assert_tx_id_not_null',
    rule: 'expect_column_values_to_not_be_null(column="transaction_id")',
    column: 'transaction_id',
    status: 'PASSED',
    evaluatedRows: 142050,
    unexpectedCount: 0,
    unexpectedPct: 0.0,
    severity: 'CRITICAL'
  },
  {
    id: 'assert_tx_id_unique',
    rule: 'expect_column_values_to_be_unique(column="transaction_id")',
    column: 'transaction_id',
    status: 'PASSED',
    evaluatedRows: 142050,
    unexpectedCount: 0,
    unexpectedPct: 0.0,
    severity: 'CRITICAL'
  },
  {
    id: 'assert_amount_positive',
    rule: 'expect_column_values_to_be_between(column="amount", min_value=0.01, max_value=100000)',
    column: 'amount',
    status: 'PASSED',
    evaluatedRows: 142050,
    unexpectedCount: 0,
    unexpectedPct: 0.0,
    severity: 'HIGH'
  },
  {
    id: 'assert_currency_enum',
    rule: 'expect_column_distinct_values_to_be_in_set(column="currency", values=["USD", "EUR", "GBP", "CAD"])',
    column: 'currency',
    status: 'WARNING',
    evaluatedRows: 142050,
    unexpectedCount: 14,
    unexpectedPct: 0.0098,
    severity: 'WARNING',
    note: '14 transactions with newly introduced currency code JPY detected prior to contract schema amendment.'
  },
  {
    id: 'assert_fraud_label_binary',
    rule: 'expect_column_distinct_values_to_be_in_set(column="fraud_label", values=[0, 1])',
    column: 'fraud_label',
    status: 'PASSED',
    evaluatedRows: 142050,
    unexpectedCount: 0,
    unexpectedPct: 0.0,
    severity: 'CRITICAL'
  },
  {
    id: 'assert_freshness_sla',
    rule: 'expect_table_row_count_to_equal_other_table(freshness_window="15m")',
    column: 'timestamp',
    status: 'PASSED',
    evaluatedRows: 142050,
    unexpectedCount: 0,
    unexpectedPct: 0.0,
    severity: 'HIGH'
  }
];

const defaultLineage = {
  nodes: [
    { id: 'postgres_prod', label: 'PostgreSQL Core DB', type: 'SOURCE', tech: 'PostgreSQL 16' },
    { id: 'kafka_events', label: 'kafka.payments.tx', type: 'STREAM', tech: 'Apache Kafka' },
    { id: 'iceberg_bronze', label: 'iceberg.bronze_tx', type: 'STORAGE', tech: 'Iceberg / S3' },
    { id: 'dbt_silver', label: 'dbt_silver_clean_tx', type: 'TRANSFORM', tech: 'dbt Core' },
    { id: 'ml_feature_store', label: 'Feast ML Feature Store', type: 'FEATURE_STORE', tech: 'Feast Redis' },
    { id: 'fraud_service', label: 'Realtime Fraud API', type: 'CONSUMER', tech: 'FastAPI / XGBoost' },
    { id: 'executive_bi', label: 'FinTech Boardroom BI', type: 'DASHBOARD', tech: 'Tableau / Superset' }
  ],
  edges: [
    { from: 'postgres_prod', to: 'kafka_events', label: 'Debezium CDC' },
    { from: 'kafka_events', to: 'iceberg_bronze', label: 'Spark Streaming Ingest' },
    { from: 'iceberg_bronze', to: 'dbt_silver', label: 'dbt Daily Transform' },
    { from: 'dbt_silver', to: 'ml_feature_store', label: 'Feature Pipeline' },
    { from: 'dbt_silver', to: 'executive_bi', label: 'Semantic Mart' },
    { from: 'ml_feature_store', to: 'fraud_service', label: 'Online Features (p99 < 5ms)' }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState('quality');
  const [summary, setSummary] = useState(defaultSummary);
  const [assertions, setAssertions] = useState(defaultAssertions);
  const [lineage, setLineage] = useState(defaultLineage);

  const loadData = async () => {
    const sRes = await fetchQualitySummary();
    if (sRes?.summary) setSummary(sRes.summary);
    const aRes = await fetchAssertions();
    if (aRes?.assertions) setAssertions(aRes.assertions);
    const lRes = await fetchLineage();
    if (lRes?.lineage) setLineage(lRes.lineage);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onRefresh={loadData} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'quality' && <DataQualityScorecardView summary={summary} assertions={assertions} />}
          {activeTab === 'contract' && <DataContractSpecView />}
          {activeTab === 'lineage' && <OpenLineageGraphView lineage={lineage} />}
          {activeTab === 'dataset' && <CreditCardDatasetView />}
        </main>
      </div>
    </div>
  );
}
