import { prisma } from '@/lib/prisma';

export async function isIdorEnabled(workspaceId: string): Promise<boolean> {
  try {
    const settings = await prisma.workspaceSettings.findUnique({
      where: { workspaceId },
    });
    return settings?.idorVulnerabilityEnabled ?? false;
  } catch {
    return false;
  }
}

export async function checkWorkspaceAccess(
  recordWorkspaceId: string,
  userWorkspaceId: string
): Promise<boolean> {
  if (recordWorkspaceId === userWorkspaceId) return true;
  // Check if IDOR vulnerability is enabled for the user's workspace
  const idorEnabled = await isIdorEnabled(userWorkspaceId);
  return idorEnabled;
}
