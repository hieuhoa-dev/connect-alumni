import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  integer,
  numeric,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── AUTH ENUMS ─────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("user_role", [
  "student",
  "alumni",
  "employer",
  "faculty_staff",
  "admin",
]);

export const accountStatusEnum = pgEnum("account_status", ["active", "locked"]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "internship",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "talkshow",
  "workshop",
  "job_fair",
  "other",
]);

export const eventFormatEnum = pgEnum("event_format", ["online", "offline"]);

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "declined",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "registered",
  "attended",
  "absent",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "pending",
  "published",
  "rejected",
]);

export const formTypeEnum = pgEnum("form_type", [
  "survey",
  "scholarship_application",
  "event_feedback",
  "other",
]);

export const formTargetRoleEnum = pgEnum("form_target_role", [
  "student",
  "alumni",
  "all",
]);

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "open",
  "closed",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "scale",
  "file_upload",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "open",
  "closed",
]);

export const pledgeStatusEnum = pgEnum("pledge_status", [
  "pledged",
  "fulfilled",
  "cancelled",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "reviewing",
  "approved",
  "rejected",
]);

// ─── BETTER-AUTH TABLES ─────────────────────────────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ─── PROFILES ───────────────────────────────────────────────────────────────
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    role: roleEnum("role").default("student").notNull(),
    fullName: text("full_name").notNull(),
    studentCode: text("student_code"),
    faculty: text("faculty"),
    batchYear: integer("batch_year"),
    graduationYear: integer("graduation_year"),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    status: accountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("profiles_role_idx").on(table.role),
    index("profiles_batchYear_idx").on(table.batchYear),
  ],
);

// ─── COMPANIES & MEMBERS ────────────────────────────────────────────────────
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    logoUrl: text("logo_url"),
    website: text("website"),
    industry: text("industry").notNull(),
    verificationStatus: verificationStatusEnum("verification_status")
      .default("pending")
      .notNull(),
    rejectedReason: text("rejected_reason"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    verifiedBy: text("verified_by").references(() => user.id),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("companies_verificationStatus_idx").on(table.verificationStatus),
  ],
);

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleInCompany: text("role_in_company").notNull(),
    isActiveContext: boolean("is_active_context").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("company_members_company_user_unique").on(
      table.companyId,
      table.userId,
    ),
    index("company_members_userId_idx").on(table.userId),
  ],
);

// ─── JOB POSTS ──────────────────────────────────────────────────────────────
export const jobPosts = pgTable(
  "job_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    requirements: text("requirements").notNull(),
    location: text("location").notNull(),
    jobType: jobTypeEnum("job_type").notNull(),
    salaryRange: text("salary_range"),
    applyUrlOrEmail: text("apply_url_or_email").notNull(),
    status: jobStatusEnum("status").default("pending").notNull(),
    rejectedReason: text("rejected_reason"),
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("job_posts_status_idx").on(table.status),
    index("job_posts_expiresAt_idx").on(table.expiresAt),
    index("job_posts_companyId_idx").on(table.companyId),
  ],
);

// ─── EVENTS & ATTENDANCE ────────────────────────────────────────────────────
export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: eventTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    format: eventFormatEnum("format").notNull(),
    locationOrLink: text("location_or_link").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    capacity: integer("capacity"),
    status: eventStatusEnum("status").default("draft").notNull(),
    coverImageUrl: text("cover_image_url"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("events_status_idx").on(table.status),
    index("events_startTime_idx").on(table.startTime),
  ],
);

export const eventSpeakers = pgTable(
  "event_speakers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    alumniUserId: text("alumni_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    invitationStatus: invitationStatusEnum("invitation_status")
      .default("pending")
      .notNull(),
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
    respondedAt: timestamp("responded_at"),
    note: text("note"),
  },
  (table) => [
    uniqueIndex("event_speakers_event_alumni_unique").on(
      table.eventId,
      table.alumniUserId,
    ),
    index("event_speakers_alumniUserId_idx").on(table.alumniUserId),
  ],
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    attendanceStatus: attendanceStatusEnum("attendance_status")
      .default("registered")
      .notNull(),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("event_registrations_event_user_unique").on(
      table.eventId,
      table.userId,
    ),
    index("event_registrations_userId_idx").on(table.userId),
  ],
);

// ─── EXPERIENCE POSTS ───────────────────────────────────────────────────────
export const experiencePosts = pgTable(
  "experience_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    coverImageUrl: text("cover_image_url"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    status: postStatusEnum("status").default("draft").notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("experience_posts_status_idx").on(table.status),
    index("experience_posts_authorId_idx").on(table.authorId),
  ],
);

// ─── FORM BUILDER & SURVEYS ────────────────────────────────────────────────
export const forms = pgTable(
  "forms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: formTypeEnum("type").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetBatches: integer("target_batches").array(),
    targetRole: formTargetRoleEnum("target_role").default("all").notNull(),
    deadline: timestamp("deadline"),
    status: formStatusEnum("status").default("draft").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("forms_status_idx").on(table.status)],
);

export const formQuestions = pgTable(
  "form_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),
    label: text("label").notNull(),
    options: jsonb("options").$type<string[]>(),
    isRequired: boolean("is_required").default(true).notNull(),
    config: jsonb("config").$type<{
      min?: number;
      max?: number;
      minLabel?: string;
      maxLabel?: string;
      allowedFileTypes?: string[];
      maxFileSizeMb?: number;
    }>(),
  },
  (table) => [index("form_questions_formId_idx").on(table.formId)],
);

export const formResponses = pgTable(
  "form_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id")
      .notNull()
      .references(() => forms.id, { onDelete: "cascade" }),
    respondentId: text("respondent_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("form_responses_formId_idx").on(table.formId),
    index("form_responses_respondentId_idx").on(table.respondentId),
  ],
);

export const formAnswers = pgTable(
  "form_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponses.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => formQuestions.id, { onDelete: "cascade" }),
    answerValue: jsonb("answer_value").$type<any>(),
    fileUrl: text("file_url"),
  },
  (table) => [index("form_answers_responseId_idx").on(table.responseId)],
);

// ─── SCHOLARSHIP FUND ───────────────────────────────────────────────────────
export const scholarshipCampaigns = pgTable(
  "scholarship_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    targetAmount: numeric("target_amount", {
      precision: 14,
      scale: 2,
    }).notNull(),
    currentAmount: numeric("current_amount", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    applicationFormId: uuid("application_form_id").references(() => forms.id),
    applicationDeadline: timestamp("application_deadline").notNull(),
    status: campaignStatusEnum("status").default("draft").notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("scholarship_campaigns_status_idx").on(table.status)],
);

export const donationPledges = pgTable(
  "donation_pledges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => scholarshipCampaigns.id, { onDelete: "cascade" }),
    donorId: text("donor_id").references(() => user.id),
    donorDisplayName: text("donor_display_name").notNull(),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    status: pledgeStatusEnum("status").default("pledged").notNull(),
    note: text("note"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("donation_pledges_campaignId_idx").on(table.campaignId),
    index("donation_pledges_donorId_idx").on(table.donorId),
  ],
);

export const scholarshipApplications = pgTable(
  "scholarship_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => scholarshipCampaigns.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    formResponseId: uuid("form_response_id").references(
      () => formResponses.id,
      { onDelete: "set null" },
    ),
    status: applicationStatusEnum("status").default("pending").notNull(),
    score: numeric("score", { precision: 5, scale: 2 }),
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewNote: text("review_note"),
    decidedAt: timestamp("decided_at"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("scholarship_applications_campaignId_idx").on(table.campaignId),
    index("scholarship_applications_studentId_idx").on(table.studentId),
  ],
);

// ─── NOTIFICATIONS & AUDIT LOGS ─────────────────────────────────────────────
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    linkUrl: text("link_url"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_userId_idx").on(table.userId),
    index("notifications_isRead_idx").on(table.isRead),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id")
      .notNull()
      .references(() => user.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actorId_idx").on(table.actorId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_entityType_idx").on(table.entityType),
  ],
);

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id),
    relatedType: text("related_type").notNull(),
    relatedId: text("related_id").notNull(),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url"),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("uploaded_files_ownerId_idx").on(table.ownerId),
    index("uploaded_files_related_idx").on(table.relatedType, table.relatedId),
  ],
);
