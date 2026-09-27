import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  // ─── Auth & Profile ────────────────────────────────────────────────────────
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
    profile: r.one.profiles({ from: r.user.id, to: r.profiles.userId }),
    companyMemberships: r.many.companyMembers(),
    companiesCreated: r.many.companies({ alias: "company_creator" }),
    companiesVerified: r.many.companies({ alias: "company_verifier" }),
    eventSpeakers: r.many.eventSpeakers(),
    eventRegistrations: r.many.eventRegistrations(),
    experiencePosts: r.many.experiencePosts(),
    formResponses: r.many.formResponses(),
    scholarshipApplications: r.many.scholarshipApplications({ alias: "app_student" }),
    scholarshipReviews: r.many.scholarshipApplications({ alias: "app_reviewer" }),
    pledgesDonated: r.many.donationPledges({ alias: "pledge_donor" }),
    pledgesCreated: r.many.donationPledges({ alias: "pledge_creator" }),
    notifications: r.many.notifications(),
    auditLogs: r.many.auditLogs(),
  },
  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },
  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id }),
  },
  profiles: {
    user: r.one.user({ from: r.profiles.userId, to: r.user.id }),
  },

  // ─── Companies & Members ───────────────────────────────────────────────────
  companies: {
    creator: r.one.user({
      from: r.companies.createdBy,
      to: r.user.id,
      alias: "company_creator",
    }),
    verifier: r.one.user({
      from: r.companies.verifiedBy,
      to: r.user.id,
      alias: "company_verifier",
    }),
    members: r.many.companyMembers(),
    jobPosts: r.many.jobPosts(),
  },
  companyMembers: {
    company: r.one.companies({ from: r.companyMembers.companyId, to: r.companies.id }),
    user: r.one.user({ from: r.companyMembers.userId, to: r.user.id }),
  },

  // ─── Job Posts ─────────────────────────────────────────────────────────────
  jobPosts: {
    company: r.one.companies({ from: r.jobPosts.companyId, to: r.companies.id }),
    reviewer: r.one.user({ from: r.jobPosts.reviewedBy, to: r.user.id }),
  },

  // ─── Events ────────────────────────────────────────────────────────────────
  events: {
    creator: r.one.user({ from: r.events.createdBy, to: r.user.id }),
    speakers: r.many.eventSpeakers(),
    registrations: r.many.eventRegistrations(),
  },
  eventSpeakers: {
    event: r.one.events({ from: r.eventSpeakers.eventId, to: r.events.id }),
    alumni: r.one.user({ from: r.eventSpeakers.alumniUserId, to: r.user.id }),
  },
  eventRegistrations: {
    event: r.one.events({ from: r.eventRegistrations.eventId, to: r.events.id }),
    user: r.one.user({ from: r.eventRegistrations.userId, to: r.user.id }),
  },

  // ─── Experience Posts ──────────────────────────────────────────────────────
  experiencePosts: {
    author: r.one.user({ from: r.experiencePosts.authorId, to: r.user.id }),
  },

  // ─── Form Builder ──────────────────────────────────────────────────────────
  forms: {
    creator: r.one.user({ from: r.forms.createdBy, to: r.user.id }),
    questions: r.many.formQuestions(),
    responses: r.many.formResponses(),
  },
  formQuestions: {
    form: r.one.forms({ from: r.formQuestions.formId, to: r.forms.id }),
    answers: r.many.formAnswers(),
  },
  formResponses: {
    form: r.one.forms({ from: r.formResponses.formId, to: r.forms.id }),
    respondent: r.one.user({ from: r.formResponses.respondentId, to: r.user.id }),
    answers: r.many.formAnswers(),
  },
  formAnswers: {
    response: r.one.formResponses({ from: r.formAnswers.responseId, to: r.formResponses.id }),
    question: r.one.formQuestions({ from: r.formAnswers.questionId, to: r.formQuestions.id }),
  },

  // ─── Scholarship Fund ──────────────────────────────────────────────────────
  scholarshipCampaigns: {
    creator: r.one.user({ from: r.scholarshipCampaigns.createdBy, to: r.user.id }),
    applicationForm: r.one.forms({ from: r.scholarshipCampaigns.applicationFormId, to: r.forms.id }),
    pledges: r.many.donationPledges(),
    applications: r.many.scholarshipApplications(),
  },
  donationPledges: {
    campaign: r.one.scholarshipCampaigns({ from: r.donationPledges.campaignId, to: r.scholarshipCampaigns.id }),
    donor: r.one.user({
      from: r.donationPledges.donorId,
      to: r.user.id,
      alias: "pledge_donor",
    }),
    creator: r.one.user({
      from: r.donationPledges.createdBy,
      to: r.user.id,
      alias: "pledge_creator",
    }),
  },
  scholarshipApplications: {
    campaign: r.one.scholarshipCampaigns({ from: r.scholarshipApplications.campaignId, to: r.scholarshipCampaigns.id }),
    student: r.one.user({
      from: r.scholarshipApplications.studentId,
      to: r.user.id,
      alias: "app_student",
    }),
    formResponse: r.one.formResponses({ from: r.scholarshipApplications.formResponseId, to: r.formResponses.id }),
    reviewer: r.one.user({
      from: r.scholarshipApplications.reviewedBy,
      to: r.user.id,
      alias: "app_reviewer",
    }),
  },

  // ─── Notifications & Logs ──────────────────────────────────────────────────
  notifications: {
    user: r.one.user({ from: r.notifications.userId, to: r.user.id }),
  },
  auditLogs: {
    actor: r.one.user({ from: r.auditLogs.actorId, to: r.user.id }),
  },
}));
