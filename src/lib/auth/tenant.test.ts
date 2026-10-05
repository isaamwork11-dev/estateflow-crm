import { describe, expect, it } from 'vitest';
import { agentFilter, orgFilter } from './tenant';

describe('tenant isolation filters', () => {
  it('scopes queries to organization', () => {
    const f = orgFilter({
      id: 'u1',
      organizationId: '507f1f77bcf86cd799439011',
      role: 'SALES_AGENT',
      name: 'Agent',
      email: 'a@test.com',
    });
    expect(f.organizationId?.toString()).toBe('507f1f77bcf86cd799439011');
  });

  it('restricts agents to assigned leads', () => {
    const f = agentFilter({
      id: '507f1f77bcf86cd799439012',
      organizationId: '507f1f77bcf86cd799439011',
      role: 'SALES_AGENT',
      name: 'Agent',
      email: 'a@test.com',
    });
    expect(f.assignedTo?.toString()).toBe('507f1f77bcf86cd799439012');
  });

  it('allows managers full org access', () => {
    const f = agentFilter({
      id: '507f1f77bcf86cd799439013',
      organizationId: '507f1f77bcf86cd799439011',
      role: 'COMPANY_OWNER',
      name: 'Owner',
      email: 'o@test.com',
    });
    expect(f.organizationId?.toString()).toBe('507f1f77bcf86cd799439011');
    expect(f.assignedTo).toBeUndefined();
  });
});
