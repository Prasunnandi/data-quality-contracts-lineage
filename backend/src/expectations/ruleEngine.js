/**
 * Great Expectations Validation Rule Engine
 * Implements 15 core tabular and column data quality expectation rules with
 * statistical boundary checking, unexpected value counting, and compliance scoring.
 */

export class GreatExpectationsRuleEngine {
  constructor(options = {}) {
    this.defaultMostlyThreshold = options.defaultMostlyThreshold ?? 1.0; // 100% compliance default
  }

  /**
   * Helper to extract column values from rows
   */
  _getColumnValues(rows, column) {
    return rows.map(r => (r ? r[column] : undefined));
  }

  // 1. expect_column_to_exist
  expect_column_to_exist(rows, { column }) {
    if (!rows || rows.length === 0) {
      return { success: false, expectation: 'expect_column_to_exist', column, message: 'Table has 0 rows' };
    }
    const exists = column in rows[0];
    return {
      success: exists,
      expectation: 'expect_column_to_exist',
      column,
      observed_value: exists,
      message: exists ? `Column "${column}" exists` : `Column "${column}" not found in dataset`
    };
  }

  // 2. expect_column_values_to_not_be_null
  expect_column_values_to_not_be_null(rows, { column, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column);
    const nulls = vals.filter(v => v === null || v === undefined || v === '');
    const successRatio = (vals.length - nulls.length) / (vals.length || 1);
    const success = successRatio >= mostly;
    return {
      success,
      expectation: 'expect_column_values_to_not_be_null',
      column,
      total_records: vals.length,
      unexpected_count: nulls.length,
      unexpected_percent: Number(((nulls.length / (vals.length || 1)) * 100).toFixed(2)),
      mostly
    };
  }

  // 3. expect_column_values_to_be_null
  expect_column_values_to_be_null(rows, { column, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column);
    const notNulls = vals.filter(v => v !== null && v !== undefined && v !== '');
    const successRatio = (vals.length - notNulls.length) / (vals.length || 1);
    const success = successRatio >= mostly;
    return {
      success,
      expectation: 'expect_column_values_to_be_null',
      column,
      total_records: vals.length,
      unexpected_count: notNulls.length,
      unexpected_percent: Number(((notNulls.length / (vals.length || 1)) * 100).toFixed(2)),
      mostly
    };
  }

  // 4. expect_column_values_to_be_of_type
  expect_column_values_to_be_of_type(rows, { column, expected_type, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined);
    const mismatches = vals.filter(v => {
      if (expected_type === 'number') return typeof v !== 'number' || isNaN(v);
      if (expected_type === 'string') return typeof v !== 'string';
      if (expected_type === 'boolean') return typeof v !== 'boolean';
      if (expected_type === 'date') return !isNaN(Date.parse(v));
      return typeof v !== expected_type;
    });
    const successRatio = (vals.length - mismatches.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_be_of_type',
      column,
      expected_type,
      unexpected_count: mismatches.length,
      unexpected_percent: Number(((mismatches.length / (vals.length || 1)) * 100).toFixed(2))
    };
  }

  // 5. expect_column_values_to_be_in_set
  expect_column_values_to_be_in_set(rows, { column, value_set, mostly = 1.0 }) {
    const allowed = new Set(value_set);
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined);
    const unexpected = vals.filter(v => !allowed.has(v));
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_be_in_set',
      column,
      value_set,
      unexpected_count: unexpected.length,
      unexpected_values: Array.from(new Set(unexpected)).slice(0, 5)
    };
  }

  // 6. expect_column_values_to_not_be_in_set
  expect_column_values_to_not_be_in_set(rows, { column, value_set, mostly = 1.0 }) {
    const forbidden = new Set(value_set);
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined);
    const unexpected = vals.filter(v => forbidden.has(v));
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_not_be_in_set',
      column,
      unexpected_count: unexpected.length,
      unexpected_values: Array.from(new Set(unexpected)).slice(0, 5)
    };
  }

  // 7. expect_column_values_to_be_between
  expect_column_values_to_be_between(rows, { column, min_value = -Infinity, max_value = Infinity, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column)
      .filter(v => v !== null && v !== undefined && !isNaN(Number(v)))
      .map(Number);
    const unexpected = vals.filter(v => v < min_value || v > max_value);
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_be_between',
      column,
      min_value,
      max_value,
      unexpected_count: unexpected.length,
      unexpected_percent: Number(((unexpected.length / (vals.length || 1)) * 100).toFixed(2))
    };
  }

  // 8. expect_column_value_lengths_to_be_between
  expect_column_value_lengths_to_be_between(rows, { column, min_value = 0, max_value = Infinity, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined).map(String);
    const unexpected = vals.filter(v => v.length < min_value || v.length > max_value);
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_value_lengths_to_be_between',
      column,
      min_length: min_value,
      max_length: max_value,
      unexpected_count: unexpected.length
    };
  }

  // 9. expect_column_values_to_match_regex
  expect_column_values_to_match_regex(rows, { column, regex, mostly = 1.0 }) {
    const re = new RegExp(regex);
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined).map(String);
    const unexpected = vals.filter(v => !re.test(v));
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_match_regex',
      column,
      regex: regex.toString(),
      unexpected_count: unexpected.length
    };
  }

  // 10. expect_column_values_to_not_match_regex
  expect_column_values_to_not_match_regex(rows, { column, regex, mostly = 1.0 }) {
    const re = new RegExp(regex);
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined).map(String);
    const unexpected = vals.filter(v => re.test(v));
    const successRatio = (vals.length - unexpected.length) / (vals.length || 1);
    return {
      success: successRatio >= mostly,
      expectation: 'expect_column_values_to_not_match_regex',
      column,
      unexpected_count: unexpected.length
    };
  }

  // 11. expect_column_values_to_be_unique
  expect_column_values_to_be_unique(rows, { column, mostly = 1.0 }) {
    const vals = this._getColumnValues(rows, column).filter(v => v !== null && v !== undefined);
    const seen = new Set();
    const duplicates = new Set();
    vals.forEach(v => {
      if (seen.has(v)) duplicates.add(v);
      seen.add(v);
    });
    const success = duplicates.size === 0;
    return {
      success,
      expectation: 'expect_column_values_to_be_unique',
      column,
      duplicate_distinct_count: duplicates.size,
      duplicate_examples: Array.from(duplicates).slice(0, 5)
    };
  }

  // 12. expect_column_min_to_be_between
  expect_column_min_to_be_between(rows, { column, min_value = -Infinity, max_value = Infinity }) {
    const vals = this._getColumnValues(rows, column).map(Number).filter(v => !isNaN(v));
    const observed_min = vals.length > 0 ? Math.min(...vals) : null;
    const success = observed_min !== null && observed_min >= min_value && observed_min <= max_value;
    return {
      success,
      expectation: 'expect_column_min_to_be_between',
      column,
      observed_min,
      min_value,
      max_value
    };
  }

  // 13. expect_column_max_to_be_between
  expect_column_max_to_be_between(rows, { column, min_value = -Infinity, max_value = Infinity }) {
    const vals = this._getColumnValues(rows, column).map(Number).filter(v => !isNaN(v));
    const observed_max = vals.length > 0 ? Math.max(...vals) : null;
    const success = observed_max !== null && observed_max >= min_value && observed_max <= max_value;
    return {
      success,
      expectation: 'expect_column_max_to_be_between',
      column,
      observed_max,
      min_value,
      max_value
    };
  }

  // 14. expect_column_mean_to_be_between
  expect_column_mean_to_be_between(rows, { column, min_value = -Infinity, max_value = Infinity }) {
    const vals = this._getColumnValues(rows, column).map(Number).filter(v => !isNaN(v));
    const sum = vals.reduce((a, b) => a + b, 0);
    const observed_mean = vals.length > 0 ? sum / vals.length : null;
    const success = observed_mean !== null && observed_mean >= min_value && observed_mean <= max_value;
    return {
      success,
      expectation: 'expect_column_mean_to_be_between',
      column,
      observed_mean: observed_mean !== null ? Number(observed_mean.toFixed(4)) : null,
      min_value,
      max_value
    };
  }

  // 15. expect_table_row_count_to_be_between
  expect_table_row_count_to_be_between(rows, { min_value = 0, max_value = Infinity }) {
    const count = rows ? rows.length : 0;
    const success = count >= min_value && count <= max_value;
    return {
      success,
      expectation: 'expect_table_row_count_to_be_between',
      observed_row_count: count,
      min_value,
      max_value
    };
  }

  /**
   * Run a complete expectation suite against a dataset
   * @param {Array<Object>} rows - Tabular dataset
   * @param {Array<Object>} expectations - Array of expectation definitions [{ type, kwargs }]
   * @returns {Object} Comprehensive evaluation summary and per-rule results
   */
  validateSuite(rows = [], expectations = []) {
    const results = expectations.map(exp => {
      const fn = this[exp.type];
      if (typeof fn !== 'function') {
        return {
          success: false,
          expectation: exp.type,
          error: `Unknown expectation rule: ${exp.type}`
        };
      }
      return fn.call(this, rows, exp.kwargs || {});
    });

    const passedCount = results.filter(r => r.success).length;
    const failedCount = results.length - passedCount;
    const successPercent = results.length > 0 ? Number(((passedCount / results.length) * 100).toFixed(2)) : 100.0;

    return {
      success: failedCount === 0,
      total_expectations: results.length,
      passed_count: passedCount,
      failed_count: failedCount,
      success_percent: successPercent,
      results,
      evaluated_at: new Date().toISOString()
    };
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GreatExpectationsRuleEngine
  };
}

export default GreatExpectationsRuleEngine;
