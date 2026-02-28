import { getAllowedNextStages, isValidStageTransition } from './stage-transitions.js';

describe('stage transition rules', () => {
  it('returns expected allowed next stages', () => {
    expect(getAllowedNextStages('applied')).toEqual(['screening']);
    expect(getAllowedNextStages('screening')).toEqual(['interview', 'decision']);
    expect(getAllowedNextStages('interview')).toEqual(['decision']);
    expect(getAllowedNextStages('decision')).toEqual([]);
  });

  it('validates transitions correctly', () => {
    expect(isValidStageTransition('applied', 'screening')).toBe(true);
    expect(isValidStageTransition('screening', 'interview')).toBe(true);
    expect(isValidStageTransition('screening', 'decision')).toBe(true);
    expect(isValidStageTransition('interview', 'decision')).toBe(true);

    expect(isValidStageTransition('applied', 'interview')).toBe(false);
    expect(isValidStageTransition('decision', 'interview')).toBe(false);
    expect(isValidStageTransition('decision', 'decision')).toBe(false);
  });
});
