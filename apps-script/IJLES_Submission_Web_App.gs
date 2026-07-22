const IJLES_CONFIG = {
  notificationEmail: "ijlescontact@gmail.com",
  authorSubmissionsFolderId: "1890PneWVnnMBIOlPkamHpwOOsebJIVZf",
  reviewerReportsFolderId: "1SnlITC8LaDzmRpBGEyeAW3Gg3Bshx9I1",
  authorSubmissionLogSheetId: "1w-W-Njycan8Vrb940qaaGq85I_P_qVHTQXYz9cTLVko",
  reviewerReportLogSheetId: "1QcxGR5siK6uva_vXLs-oTvjwjRvOqyrqafu5DrzWGBs"
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const formType = payload.formType || "author-submission";
    const result = formType === "reviewer-evaluation"
      ? saveReviewerEvaluation_(payload)
      : saveAuthorSubmission_(payload);

    return jsonResponse_({ success: true, result });
  } catch (error) {
    return jsonResponse_({ success: false, message: error.message });
  }
}

function saveAuthorSubmission_(payload) {
  const submissionId = makeSubmissionId_("IJLES");
  const folderName = cleanName_(`${submissionId} - ${payload.manuscriptTitle || "Untitled Manuscript"}`);
  const parent = DriveApp.getFolderById(IJLES_CONFIG.authorSubmissionsFolderId);
  const folder = parent.createFolder(folderName);
  const file = saveUploadedFile_(folder, payload.file);

  const row = [
    new Date(),
    submissionId,
    payload.manuscriptTitle || "",
    payload.correspondingAuthor || "",
    payload.authorEmail || "",
    payload.affiliation || "",
    payload.articleType || "",
    payload.authorNote || "",
    payload.originalityDeclaration || "",
    payload.ethicsDeclaration || "",
    payload.correspondenceConsent || "",
    file ? file.getName() : "",
    file ? file.getUrl() : "",
    folder.getUrl()
  ];

  SpreadsheetApp.openById(IJLES_CONFIG.authorSubmissionLogSheetId)
    .getSheets()[0]
    .appendRow(row);

  MailApp.sendEmail({
    to: IJLES_CONFIG.notificationEmail,
    subject: `IJLES Manuscript Submission - ${submissionId}`,
    htmlBody: [
      `<p><strong>New IJLES manuscript submission received.</strong></p>`,
      `<p><strong>Submission ID:</strong> ${escapeHtml_(submissionId)}</p>`,
      `<p><strong>Title:</strong> ${escapeHtml_(payload.manuscriptTitle || "")}</p>`,
      `<p><strong>Corresponding author:</strong> ${escapeHtml_(payload.correspondingAuthor || "")}</p>`,
      `<p><strong>Author email:</strong> ${escapeHtml_(payload.authorEmail || "")}</p>`,
      `<p><strong>Article type:</strong> ${escapeHtml_(payload.articleType || "")}</p>`,
      `<p><strong>Folder:</strong> <a href="${folder.getUrl()}">${folder.getUrl()}</a></p>`,
      file ? `<p><strong>File:</strong> <a href="${file.getUrl()}">${escapeHtml_(file.getName())}</a></p>` : ""
    ].join("")
  });

  return { submissionId, folderUrl: folder.getUrl(), fileUrl: file ? file.getUrl() : "" };
}

function saveReviewerEvaluation_(payload) {
  const submissionId = makeSubmissionId_("REV");
  const folderName = cleanName_(`${submissionId} - ${payload.manuscriptTitle || payload.manuscriptNumber || "Reviewer Report"}`);
  const parent = DriveApp.getFolderById(IJLES_CONFIG.reviewerReportsFolderId);
  const folder = parent.createFolder(folderName);
  const file = saveUploadedFile_(folder, payload.file);
  const reportFile = folder.createFile(
    `${submissionId}-review-report.txt`,
    buildReviewerReportText_(payload),
    MimeType.PLAIN_TEXT
  );

  const row = [
    new Date(),
    submissionId,
    payload.manuscriptTitle || "",
    payload.manuscriptNumber || "",
    payload.recommendation || "",
    file ? file.getName() : reportFile.getName(),
    file ? file.getUrl() : reportFile.getUrl(),
    folder.getUrl()
  ];

  SpreadsheetApp.openById(IJLES_CONFIG.reviewerReportLogSheetId)
    .getSheets()[0]
    .appendRow(row);

  MailApp.sendEmail({
    to: IJLES_CONFIG.notificationEmail,
    subject: `IJLES Reviewer Evaluation - ${payload.manuscriptNumber || submissionId}`,
    htmlBody: [
      `<p><strong>New IJLES reviewer evaluation received.</strong></p>`,
      `<p><strong>Report ID:</strong> ${escapeHtml_(submissionId)}</p>`,
      `<p><strong>Manuscript title:</strong> ${escapeHtml_(payload.manuscriptTitle || "")}</p>`,
      `<p><strong>Manuscript number:</strong> ${escapeHtml_(payload.manuscriptNumber || "")}</p>`,
      `<p><strong>Recommendation:</strong> ${escapeHtml_(payload.recommendation || "")}</p>`,
      `<p><strong>Folder:</strong> <a href="${folder.getUrl()}">${folder.getUrl()}</a></p>`,
      `<p><strong>Report:</strong> <a href="${reportFile.getUrl()}">${escapeHtml_(reportFile.getName())}</a></p>`
    ].join("")
  });

  return { submissionId, folderUrl: folder.getUrl(), reportUrl: reportFile.getUrl() };
}

function saveUploadedFile_(folder, filePayload) {
  if (!filePayload || !filePayload.data) return null;
  const bytes = Utilities.base64Decode(filePayload.data);
  const blob = Utilities.newBlob(
    bytes,
    filePayload.mimeType || "application/octet-stream",
    cleanName_(filePayload.name || "uploaded-file")
  );
  return folder.createFile(blob);
}

function buildReviewerReportText_(payload) {
  const lines = ["IJLES REVIEWER EVALUATION REPORT", ""];
  Object.keys(payload).forEach((key) => {
    if (key === "file" || key === "formType") return;
    lines.push(`${key}:`);
    lines.push(String(payload[key] || ""));
    lines.push("");
  });
  return lines.join("\n");
}

function makeSubmissionId_(prefix) {
  const timeZone = Session.getScriptTimeZone();
  const stamp = Utilities.formatDate(new Date(), timeZone, "yyyyMMdd-HHmmss");
  return `${prefix}-${stamp}`;
}

function cleanName_(value) {
  return String(value)
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
