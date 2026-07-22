const IJLES_CONFIG = {
  notificationEmail: "ijlescontact@gmail.com",
  rootFolderName: "IJLES Editorial Office",
  authorSubmissionsFolderName: "Author Submissions",
  reviewerReportsFolderName: "Reviewer Reports",
  authorSubmissionLogName: "IJLES Submission Log",
  reviewerReportLogName: "IJLES Reviewer Report Log"
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

function doGet() {
  try {
    const workspace = getWorkspace_();
    const data = {
      rootFolderUrl: workspace.rootFolder.getUrl(),
      authorFolderUrl: workspace.authorFolder.getUrl(),
      reviewerFolderUrl: workspace.reviewerFolder.getUrl(),
      authorLogUrl: SpreadsheetApp.openById(workspace.authorSheetId).getUrl(),
      reviewerLogUrl: SpreadsheetApp.openById(workspace.reviewerSheetId).getUrl()
    };

    return HtmlService.createHtmlOutput([
      "<h1>IJLES Submission Portal is ready</h1>",
      "<p>The Google Drive workspace has been created or verified for this account.</p>",
      "<ul>",
      `<li><a href="${data.rootFolderUrl}" target="_blank">IJLES Editorial Office</a></li>`,
      `<li><a href="${data.authorFolderUrl}" target="_blank">Author Submissions</a></li>`,
      `<li><a href="${data.reviewerFolderUrl}" target="_blank">Reviewer Reports</a></li>`,
      `<li><a href="${data.authorLogUrl}" target="_blank">IJLES Submission Log</a></li>`,
      `<li><a href="${data.reviewerLogUrl}" target="_blank">IJLES Reviewer Report Log</a></li>`,
      "</ul>"
    ].join(""));
  } catch (error) {
    return HtmlService.createHtmlOutput(`<h1>IJLES Submission Portal Error</h1><p>${escapeHtml_(error.message)}</p>`);
  }
}

function saveAuthorSubmission_(payload) {
  const workspace = getWorkspace_();
  const submissionId = makeSubmissionId_("IJLES");
  const folderName = cleanName_(`${submissionId} - ${payload.manuscriptTitle || "Untitled Manuscript"}`);
  const folder = workspace.authorFolder.createFolder(folderName);
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

  SpreadsheetApp.openById(workspace.authorSheetId)
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
  const workspace = getWorkspace_();
  const submissionId = makeSubmissionId_("REV");
  const folderName = cleanName_(`${submissionId} - ${payload.manuscriptTitle || payload.manuscriptNumber || "Reviewer Report"}`);
  const folder = workspace.reviewerFolder.createFolder(folderName);
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

  SpreadsheetApp.openById(workspace.reviewerSheetId)
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

function getWorkspace_() {
  const props = PropertiesService.getScriptProperties();
  const rootFolder = getOrCreateFolder_(IJLES_CONFIG.rootFolderName);
  const authorFolder = getOrCreateChildFolder_(rootFolder, IJLES_CONFIG.authorSubmissionsFolderName);
  const reviewerFolder = getOrCreateChildFolder_(rootFolder, IJLES_CONFIG.reviewerReportsFolderName);

  const authorSheetId = getOrCreateSpreadsheet_(
    "AUTHOR_SUBMISSION_LOG_SHEET_ID",
    IJLES_CONFIG.authorSubmissionLogName,
    [
      "Timestamp",
      "Submission ID",
      "Manuscript Title",
      "Corresponding Author",
      "Author Email",
      "Affiliation",
      "Article Type",
      "Author Note",
      "Originality Declaration",
      "Ethics Declaration",
      "Correspondence Consent",
      "File Name",
      "File URL",
      "Folder URL"
    ],
    rootFolder
  );

  const reviewerSheetId = getOrCreateSpreadsheet_(
    "REVIEWER_REPORT_LOG_SHEET_ID",
    IJLES_CONFIG.reviewerReportLogName,
    [
      "Timestamp",
      "Report ID",
      "Manuscript Title",
      "Manuscript Number",
      "Recommendation",
      "File Name",
      "File URL",
      "Folder URL"
    ],
    rootFolder
  );

  props.setProperty("ROOT_FOLDER_ID", rootFolder.getId());
  props.setProperty("AUTHOR_SUBMISSIONS_FOLDER_ID", authorFolder.getId());
  props.setProperty("REVIEWER_REPORTS_FOLDER_ID", reviewerFolder.getId());

  return { rootFolder, authorFolder, reviewerFolder, authorSheetId, reviewerSheetId };
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function getOrCreateChildFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function getOrCreateSpreadsheet_(propertyName, fileName, headers, parentFolder) {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty(propertyName);
  if (existingId) {
    try {
      SpreadsheetApp.openById(existingId);
      return existingId;
    } catch (error) {
      props.deleteProperty(propertyName);
    }
  }

  const files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    const file = files.next();
    props.setProperty(propertyName, file.getId());
    ensureSheetHeaders_(file.getId(), headers);
    return file.getId();
  }

  const spreadsheet = SpreadsheetApp.create(fileName);
  const file = DriveApp.getFileById(spreadsheet.getId());
  parentFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  props.setProperty(propertyName, spreadsheet.getId());
  ensureSheetHeaders_(spreadsheet.getId(), headers);
  return spreadsheet.getId();
}

function ensureSheetHeaders_(spreadsheetId, headers) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some((cell) => String(cell || "").trim());
  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
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
