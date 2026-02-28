import type { ApplicationStage } from '@caw-hackathon/shared';

const transitionMap: Record<ApplicationStage, ApplicationStage[]> = {
  applied: ['screening'],
  screening: ['interview', 'decision'],
  interview: ['decision'],
  decision: [],
};

export const getAllowedNextStages = (stage: ApplicationStage): ApplicationStage[] => {
  return transitionMap[stage];
};

export const isValidStageTransition = (
  fromStage: ApplicationStage,
  toStage: ApplicationStage,
): boolean => {
  if (fromStage === toStage) {
    return false;
  }

  return transitionMap[fromStage].includes(toStage);
};
