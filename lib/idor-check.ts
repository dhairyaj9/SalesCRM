export async function isIdorEnabled(_workspaceId?: string): Promise<boolean> {
  return false;
}

export async function checkWorkspaceAccess(
  recordWorkspaceId: string,
  userWorkspaceId: string
): Promise<boolean> {
  if (!recordWorkspaceId || !userWorkspaceId) return false;
  return recordWorkspaceId === userWorkspaceId;
}
