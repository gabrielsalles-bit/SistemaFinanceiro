import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatDate,
  getMonthName,
  getSemaphoreColor,
  calculateFinancialHealth,
} from './formatters.ts';

const norm = (s: string) => s.replace(/\s/g, ' ');

test('formatCurrency formats BRL and treats NaN as zero', () => {
  assert.equal(norm(formatCurrency(1234.5)), 'R$ 1.234,50');
  assert.equal(norm(formatCurrency(NaN)), 'R$ 0,00');
  assert.equal(norm(formatCurrency(-10)), '-R$ 10,00');
});

test('formatCurrency masks the value when hide is true', () => {
  assert.equal(formatCurrency(999, true), 'R$ ••••••');
});

test('formatDate converts ISO to DD/MM/YY and tolerates empty or malformed input', () => {
  assert.equal(formatDate('2026-03-05'), '05/03/26');
  assert.equal(formatDate(''), '00/00/00');
  assert.equal(formatDate('not-a-date'), 'not-a-date');
  assert.equal(formatDate('2026-03-05T10:30:00Z'), '05/03/26');
});

test('getMonthName returns the PT-BR name and a fallback for out-of-range indexes', () => {
  assert.equal(getMonthName(0), 'JANEIRO');
  assert.equal(getMonthName(11), 'DEZEMBRO');
  assert.equal(getMonthName(12), 'MÊS ATUAL');
  assert.equal(getMonthName(-1), 'MÊS ATUAL');
});

test('getSemaphoreColor switches exactly at the 80% and 100% boundaries', () => {
  assert.equal(getSemaphoreColor(79.99).status, 'EXCELLENT');
  assert.equal(getSemaphoreColor(80).status, 'WARNING');
  assert.equal(getSemaphoreColor(99.99).status, 'WARNING');
  assert.equal(getSemaphoreColor(100).status, 'CRITICAL');
  assert.equal(getSemaphoreColor(0).status, 'EXCELLENT');
});

test('calculateFinancialHealth returns EXCELLENT with zero usage when no limit is defined', () => {
  for (const limit of [0, -50]) {
    const h = calculateFinancialHealth(500, limit, new Date(2026, 2, 10));
    assert.equal(h.status, 'EXCELLENT');
    assert.equal(h.percentageUsed, 0);
  }
});

test('calculateFinancialHealth is CRITICAL at exactly 100% and caps percentage at 1000', () => {
  const at100 = calculateFinancialHealth(1000, 1000, new Date(2026, 2, 10));
  assert.equal(at100.status, 'CRITICAL');
  const huge = calculateFinancialHealth(1_000_000, 1000, new Date(2026, 2, 10));
  assert.equal(huge.percentageUsed, 1000);
});

test('calculateFinancialHealth is WARNING at exactly 80% regardless of the day', () => {
  const h = calculateFinancialHealth(800, 1000, new Date(2026, 2, 31));
  assert.equal(h.status, 'WARNING');
});

test('calculateFinancialHealth flags an accelerated burn rate below 80%', () => {
  // dia 10 de 31 => ~32% do mês; 60% gasto > 32% + 20
  const fast = calculateFinancialHealth(600, 1000, new Date(2026, 2, 10));
  assert.equal(fast.status, 'WARNING');
  const ok = calculateFinancialHealth(300, 1000, new Date(2026, 2, 10));
  assert.equal(ok.status, 'EXCELLENT');
});

test('calculateFinancialHealth uses the real month length (leap-year February)', () => {
  const h = calculateFinancialHealth(100, 1000, new Date(2024, 1, 29));
  assert.equal(h.daysPassedRatio, 100);
});
