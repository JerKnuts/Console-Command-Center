export function errorReportGuidance(message: string): string {
  const guidance = 'Please report this error to the mod author and include your diagnostic log.';
  const locations = 'Log: Documents\\My Games\\Starfield\\SFSE\\Logs\\Console Command Center.log. No export is needed. Use your Windows Documents folder, including OneDrive if redirected.';
  const withGuidance = message.includes(guidance) ? message : `${message} ${guidance}`;
  return withGuidance.includes(locations) ? withGuidance : `${withGuidance} ${locations}`;
}
