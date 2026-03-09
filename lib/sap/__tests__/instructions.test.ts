import { describe, expect, it } from 'vitest';
import { buildSapInstructions } from '@/lib/sap/instructions';
import {
  normalizeInstructionText,
  normalizeInstructionTextForMatch,
} from '@/lib/sap/instruction-normalization';

describe('instruction normalization', () => {
  it('normalizes HTML, entities, and whitespace for matching', () => {
    const raw = '<p>Hello&nbsp;&nbsp;World</p>\n\nLine 2';
    expect(normalizeInstructionText(raw)).toBe('Hello World Line 2');
    expect(normalizeInstructionTextForMatch(raw)).toBe('hello world line 2');
  });

  it('filters SAP instructions when exclusion matches formatted text', () => {
    const instructions = [
      {
        subProjectId: 'SP1',
        contentId: 'CID1',
        serviceStep: 'TRANSLREGU',
        slsLang: 'en',
        lastChangedAt: '2026-01-01T00:00:00.000Z',
        instructionShort: '<b>Do this</b>',
        instructionLong: '<p>Hello&nbsp;World</p>',
        isTemplate: false,
        deleted: false,
      },
      {
        subProjectId: 'SP1',
        contentId: 'CID2',
        serviceStep: 'TRANSLREGU',
        slsLang: 'en',
        lastChangedAt: '2026-01-01T00:00:00.000Z',
        instructionShort: 'Keep me',
        instructionLong: 'A different instruction',
        isTemplate: false,
        deleted: false,
      },
    ];

    const exclusions = ['  Hello   World  '];
    const result = buildSapInstructions(instructions, exclusions);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result?.[0].instructionLong).toBe('A different instruction');
  });
});