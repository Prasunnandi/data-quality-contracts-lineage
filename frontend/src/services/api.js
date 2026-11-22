const API_BASE = 'http://localhost:8006';

export async function fetchQualitySummary() {
  try {
    const res = await fetch(`${API_BASE}/api/quality-summary`);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchAssertions() {
  try {
    const res = await fetch(`${API_BASE}/api/assertions`);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchLineage() {
  try {
    const res = await fetch(`${API_BASE}/api/lineage`);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function validateSchemaChange(changes) {
  try {
    const res = await fetch(`${API_BASE}/api/validate-schema-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposedChanges: changes })
    });
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}
