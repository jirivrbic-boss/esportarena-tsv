/** Časová osa: 1. 1. 2026 = 0 %, 1. 9. 2026 = 100 % (otevření registrace). */
export const REGISTRATION_COUNTDOWN_START = new Date(2026, 0, 1, 0, 0, 0, 0);
export const REGISTRATION_OPENS_AT = new Date(2026, 8, 1, 0, 0, 0, 0);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type RegistrationCountdownState = {
  percent: number;
  percentRounded: number;
  daysUntilRegistration: number;
  registrationOpen: boolean;
  registrationOpensLabel: string;
};

export function getRegistrationCountdownState(
  now: Date = new Date()
): RegistrationCountdownState {
  const startMs = REGISTRATION_COUNTDOWN_START.getTime();
  const endMs = REGISTRATION_OPENS_AT.getTime();
  const nowMs = now.getTime();

  const registrationOpensLabel = REGISTRATION_OPENS_AT.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  if (nowMs >= endMs) {
    return {
      percent: 100,
      percentRounded: 100,
      daysUntilRegistration: 0,
      registrationOpen: true,
      registrationOpensLabel,
    };
  }

  if (nowMs <= startMs) {
    const daysUntilRegistration = Math.ceil((endMs - nowMs) / MS_PER_DAY);
    return {
      percent: 0,
      percentRounded: 0,
      daysUntilRegistration,
      registrationOpen: false,
      registrationOpensLabel,
    };
  }

  const percent = ((nowMs - startMs) / (endMs - startMs)) * 100;
  const daysUntilRegistration = Math.ceil((endMs - nowMs) / MS_PER_DAY);

  return {
    percent,
    percentRounded: Math.min(99, Math.max(1, Math.round(percent))),
    daysUntilRegistration,
    registrationOpen: false,
    registrationOpensLabel,
  };
}
