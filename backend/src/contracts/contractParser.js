/**
 * OpenDataContract v2.2 Specification Parser and Quality Validator
 * Validates data contract schemas, Service Level Agreements (SLAs), and data quality assertions.
 */

export class OpenDataContractParser {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.strictTypes=true] - Enforce exact type match
   */
  constructor(options = {}) {
    this.strictTypes = options.strictTypes ?? true;
    this.supportedVersions = ['2.0', '2.1', '2.2'];
  }

  /**
   * Validate and normalize an OpenDataContract specification
   * @param {Object} spec - Parsed YAML/JSON data contract specification
   * @returns {Object} Validated and normalized contract object
   */
  parseContract(spec) {
    if (!spec || typeof spec !== 'object') {
      throw new Error('Invalid contract specification: Root must be a non-null object');
    }

    // Verify OpenDataContract version
    const version = String(spec.dataContractSpecification || spec.version || '');
    if (!this.supportedVersions.some(v => version.includes(v))) {
      throw new Error(`Unsupported OpenDataContract version: "${version}". Supported versions: ${this.supportedVersions.join(', ')}`);
    }

    // Validate Metadata
    if (!spec.id && !spec.dataset) {
      throw new Error('Contract missing mandatory dataset identifier ("id" or "dataset")');
    }

    const normalized = {
      id: spec.id || spec.dataset,
      version: spec.version || '2.2.0',
      domain: spec.domain || 'enterprise',
      status: spec.status || 'active',
      owner: spec.owner || 'data-engineering',
      schema: this._normalizeSchema(spec.schema || spec.fields || []),
      sla: this._normalizeSla(spec.sla || spec.serviceLevelAgreement || {}),
      qualityRules: spec.qualityRules || spec.checks || []
    };

    return normalized;
  }

  /**
   * Evaluate a dataset batch against a parsed contract
   * @param {Object} contract - Output from parseContract
   * @param {Array<Object>} records - Array of data rows to validate
   * @param {Object} [metadata] - Runtime execution metadata (e.g. executionTimestamp)
   * @returns {Object} Comprehensive quality and SLA compliance evaluation
   */
  validateData(contract, records = [], metadata = {}) {
    const violations = [];
    const schemaMap = new Map(contract.schema.map(f => [f.name, f]));

    let totalCheckedFields = 0;
    let fieldErrors = 0;

    // 1. Schema & Nullability validation
    records.forEach((row, rowIndex) => {
      // Check required fields and data types
      for (const field of contract.schema) {
        totalCheckedFields++;
        const val = row[field.name];

        if (val === undefined || val === null || val === '') {
          if (field.required) {
            fieldErrors++;
            violations.push({
              type: 'NULLABILITY_VIOLATION',
              severity: 'ERROR',
              rowIndex,
              field: field.name,
              message: `Field "${field.name}" is required and cannot be null/empty`
            });
          }
        } else {
          // Type checking
          if (!this._matchesType(val, field.type)) {
            fieldErrors++;
            violations.push({
              type: 'SCHEMA_TYPE_MISMATCH',
              severity: 'ERROR',
              rowIndex,
              field: field.name,
              expectedType: field.type,
              actualValue: val,
              message: `Field "${field.name}" expected type ${field.type}, got ${typeof val}`
            });
          }
        }
      }
    });

    // 2. SLA Freshness & Volume validation
    const slaViolations = [];
    if (contract.sla.maxFreshnessMinutes && metadata.lastProducedTimestamp) {
      const now = metadata.evaluationTimestamp ? new Date(metadata.evaluationTimestamp) : new Date();
      const produced = new Date(metadata.lastProducedTimestamp);
      const delayMinutes = (now - produced) / (1000 * 60);

      if (delayMinutes > contract.sla.maxFreshnessMinutes) {
        slaViolations.push({
          type: 'FRESHNESS_BREACH',
          severity: 'CRITICAL',
          maxAllowedMinutes: contract.sla.maxFreshnessMinutes,
          actualDelayMinutes: Math.round(delayMinutes),
          message: `Data freshness threshold exceeded by ${Math.round(delayMinutes - contract.sla.maxFreshnessMinutes)} minutes`
        });
      }
    }

    if (contract.sla.minRowCount !== undefined && records.length < contract.sla.minRowCount) {
      slaViolations.push({
        type: 'VOLUME_DROP_ANOMALY',
        severity: 'WARNING',
        minExpectedRows: contract.sla.minRowCount,
        actualRows: records.length,
        message: `Row count (${records.length}) fell below minimum contract SLA (${contract.sla.minRowCount})`
      });
    }

    const allViolations = [...violations, ...slaViolations];
    const isCompliant = allViolations.filter(v => v.severity === 'ERROR' || v.severity === 'CRITICAL').length === 0;

    return {
      contractId: contract.id,
      evaluatedRows: records.length,
      isCompliant,
      complianceScorePct: totalCheckedFields > 0 ? Number((((totalCheckedFields - fieldErrors) / totalCheckedFields) * 100).toFixed(2)) : 100,
      totalViolations: allViolations.length,
      violations: allViolations,
      slaSummary: {
        freshnessStatus: slaViolations.some(v => v.type === 'FRESHNESS_BREACH') ? 'BREACHED' : 'HEALTHY',
        volumeStatus: slaViolations.some(v => v.type === 'VOLUME_DROP_ANOMALY') ? 'ANOMALOUS' : 'HEALTHY'
      }
    };
  }

  _normalizeSchema(schemaList) {
    return schemaList.map(f => ({
      name: f.name || f.field,
      type: (f.type || 'string').toLowerCase(),
      required: f.required ?? (!f.nullable),
      description: f.description || ''
    }));
  }

  _normalizeSla(sla) {
    return {
      maxFreshnessMinutes: sla.maxFreshnessMinutes || sla.freshnessMinutes || 60,
      minRowCount: sla.minRowCount || 1,
      availabilityPct: sla.availabilityPct || 99.9
    };
  }

  _matchesType(val, type) {
    switch (type) {
      case 'string':
      case 'text':
      case 'varchar':
        return typeof val === 'string';
      case 'integer':
      case 'int':
      case 'bigint':
        return Number.isInteger(Number(val));
      case 'float':
      case 'number':
      case 'double':
      case 'decimal':
        return !isNaN(Number(val));
      case 'boolean':
      case 'bool':
        return typeof val === 'boolean' || val === 'true' || val === 'false';
      case 'timestamp':
      case 'date':
      case 'datetime':
        return !isNaN(Date.parse(val));
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(val));
      default:
        return true;
    }
  }
}

export default OpenDataContractParser;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenDataContractParser;
  module.exports.OpenDataContractParser = OpenDataContractParser;
}
