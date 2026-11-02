import * as FileSystem from "expo-file-system/legacy";

const SNAPS_DIR = `${FileSystem.documentDirectory}snaps/`;

/**
 * Copies a freshly captured photo from the temporary cache
 * into permanent app storage and returns the new URI.
 */
export async function saveSnapPhoto(tempUri: string): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(SNAPS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(SNAPS_DIR, { intermediates: true });
  }

  const permanentUri = `${SNAPS_DIR}${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: tempUri, to: permanentUri });
  return permanentUri;
}