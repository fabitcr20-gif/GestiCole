import { google } from "googleapis";
import { auth as getAuth } from "@/auth";

const BACKUP_FOLDER_NAME = "GestiCole - Respaldos";

/** Obtiene un cliente autenticado de Google usando el token de la sesión actual. */
export async function getGoogleAuthClient() {
  const session = await getAuth();
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) return null;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

export async function getOrCreateBackupFolder(
  authClient: InstanceType<typeof google.auth.OAuth2>,
  existingFolderId?: string | null
) {
  const drive = google.drive({ version: "v3", auth: authClient });

  if (existingFolderId) {
    try {
      await drive.files.get({ fileId: existingFolderId, fields: "id" });
      return existingFolderId;
    } catch {
      // La carpeta ya no existe o no es accesible; se crea una nueva.
    }
  }

  const search = await drive.files.list({
    q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });
  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });
  return folder.data.id!;
}

export async function uploadFileToDrive(
  authClient: InstanceType<typeof google.auth.OAuth2>,
  folderId: string,
  fileName: string,
  mimeType: string,
  content: string | Buffer
) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const file = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: content },
    fields: "id, webViewLink",
  });
  return file.data;
}

export async function sendGmail(
  authClient: InstanceType<typeof google.auth.OAuth2>,
  { to, subject, html }: { to: string; subject: string; html: string }
) {
  const gmail = google.gmail({ version: "v1", auth: authClient });

  const message = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "",
    html,
  ].join("\n");

  const encoded = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encoded },
  });
}

export async function listClassroomCourses(
  authClient: InstanceType<typeof google.auth.OAuth2>
) {
  const classroom = google.classroom({ version: "v1", auth: authClient });
  const res = await classroom.courses.list({ courseStates: ["ACTIVE"] });
  return res.data.courses ?? [];
}

export async function listClassroomStudents(
  authClient: InstanceType<typeof google.auth.OAuth2>,
  courseId: string
) {
  const classroom = google.classroom({ version: "v1", auth: authClient });
  const res = await classroom.courses.students.list({ courseId });
  return res.data.students ?? [];
}
