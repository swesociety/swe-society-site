/**
 * Centralized enum for all activity log action names.
 * Format: CATEGORY.ENTITY_OPERATION
 * Used in all controllers to ensure consistent, meaningful action strings.
 */

const ActivityAction = Object.freeze({

  // ─── Auth ────────────────────────────────────────────────────────────────
  AUTH_LOGIN_SUCCESS:           "auth.login.success",
  AUTH_LOGIN_FAILED:            "auth.login.failed",
  AUTH_LOGOUT:                  "auth.logout",
  AUTH_SIGNUP:                  "auth.signup",
  AUTH_OTP_REQUESTED:           "auth.otp.requested",
  AUTH_OTP_VERIFIED:            "auth.otp.verified",
  AUTH_PASSWORD_CHANGED:        "auth.password.changed",
  AUTH_PASSWORD_RESET_BY_ADMIN: "auth.password.reset_by_admin",

  // ─── User ────────────────────────────────────────────────────────────────
  USER_CREATED:                 "user.created",
  USER_BULK_CREATED:            "user.bulk_created",
  USER_PROFILE_UPDATED:         "user.profile.updated",
  USER_DELETED:                 "user.deleted",
  USER_BULK_DELETED:            "user.bulk_deleted",

  // ─── Role ────────────────────────────────────────────────────────────────
  ROLE_CREATED:                 "role.created",
  ROLE_UPDATED:                 "role.updated",
  ROLE_DELETED:                 "role.deleted",
  ROLE_DEFAULT_CHANGED:         "role.default.changed",
  ROLE_ASSIGNED:                "role.assigned",

  // ─── Blog ────────────────────────────────────────────────────────────────
  BLOG_CREATED:                 "blog.created",
  BLOG_UPDATED:                 "blog.updated",
  BLOG_STATUS_CHANGED:          "blog.status.changed",
  BLOG_DELETED:                 "blog.deleted",

  // ─── Achievement ─────────────────────────────────────────────────────────
  ACHIEVEMENT_CREATED:          "achievement.created",
  ACHIEVEMENT_UPDATED:          "achievement.updated",
  ACHIEVEMENT_STATUS_CHANGED:   "achievement.status.changed",
  ACHIEVEMENT_DELETED:          "achievement.deleted",
  ACHIEVEMENT_FULL_CREATED:     "achievement.full_submission.created",  // team + members + achievement in one go

  // ─── Achievement Team ────────────────────────────────────────────────────
  TEAM_CREATED:                 "achievement.team.created",
  TEAM_UPDATED:                 "achievement.team.updated",
  TEAM_DELETED:                 "achievement.team.deleted",
  TEAM_MEMBER_ADDED:            "achievement.team.member_added",
  TEAM_MEMBER_REMOVED:          "achievement.team.member_removed",

  // ─── Event ───────────────────────────────────────────────────────────────
  EVENT_CREATED:                "event.created",
  EVENT_UPDATED:                "event.updated",
  EVENT_DELETED:                "event.deleted",
  EVENT_UPDATE_CREATED:         "event.update.created",
  EVENT_UPDATE_UPDATED:         "event.update.updated",
  EVENT_UPDATE_DELETED:         "event.update.deleted",

  // ─── Notice ──────────────────────────────────────────────────────────────
  NOTICE_CREATED:               "notice.created",
  NOTICE_UPDATED:               "notice.updated",
  NOTICE_DELETED:               "notice.deleted",

  // ─── Election ────────────────────────────────────────────────────────────
  ELECTION_CREATED:             "election.created",
  ELECTION_UPDATED:             "election.updated",
  ELECTION_DELETED:             "election.deleted",

  COMMITTEE_POST_CREATED:       "election.committee_post.created",
  COMMITTEE_POST_UPDATED:       "election.committee_post.updated",
  COMMITTEE_POST_DELETED:       "election.committee_post.deleted",

  COMMITTEE_MEMBER_ADDED:       "election.committee_member.added",
  COMMITTEE_MEMBER_UPDATED:     "election.committee_member.updated",
  COMMITTEE_MEMBER_REMOVED:     "election.committee_member.removed",

  EXECUTIVE_COMMITTEE_CREATED:  "election.executive_committee.created",
  EXECUTIVE_COMMITTEE_UPDATED:  "election.executive_committee.updated",
  EXECUTIVE_COMMITTEE_DELETED:  "election.executive_committee.deleted",

  ELECTION_ACCESS_CREATED:      "election.voting_access.created",
  ELECTION_ACCESS_UPDATED:      "election.voting_access.updated",
  ELECTION_ACCESS_DELETED:      "election.voting_access.deleted",

  ELECTION_TRACK_CREATED:       "election.candidate_track.created",
  ELECTION_TRACK_STATUS_UPDATED:"election.candidate_track.status_updated",

  // ─── Candidate ───────────────────────────────────────────────────────────
  CANDIDATE_REGISTERED:         "candidate.registered",
  CANDIDATE_UPDATED:            "candidate.updated",
  CANDIDATE_DELETED:            "candidate.deleted",
  CANDIDATE_ALL_APPROVED:       "candidate.all_approved",

  // ─── Vote ────────────────────────────────────────────────────────────────
  VOTE_CAST:                    "vote.cast",
  VOTE_DELETED:                 "vote.deleted",

  // ─── Payment ─────────────────────────────────────────────────────────────
  PAYMENT_SUBMITTED:            "payment.submitted",
  PAYMENT_VERIFIED:             "payment.verified",
  PAYMENT_ACCEPTED:             "payment.accepted",
  PAYMENT_UPDATED:              "payment.updated",
  PAYMENT_DELETED:              "payment.deleted",
  PAYMENT_BATCH_VERIFIED:       "payment.batch.verified",
  PAYMENT_BATCH_ACCEPTED:       "payment.batch.accepted",

  PAYMENT_TYPE_CREATED:         "payment.type.created",
  PAYMENT_TYPE_UPDATED:         "payment.type.updated",
  PAYMENT_TYPE_DELETED:         "payment.type.deleted",

  PAYMENT_METHOD_CREATED:       "payment.method.created",
  PAYMENT_METHOD_UPDATED:       "payment.method.updated",
  PAYMENT_METHOD_DELETED:       "payment.method.deleted",

  // ─── Society Fee ─────────────────────────────────────────────────────────
  SOCIETY_FEE_VERIFIED:         "payment.society_fee.verified",
  SOCIETY_FEE_UNVERIFIED:       "payment.society_fee.unverified",
  SOCIETY_FEE_ACCEPTED:         "payment.society_fee.accepted",
  SOCIETY_FEE_UPDATED:          "payment.society_fee.updated",
  SOCIETY_FEE_MANUAL_SAVED:     "payment.society_fee.manual_saved",
  SOCIETY_FEE_DELETED:          "payment.society_fee.deleted",
  SOCIETY_FEE_BATCH_VERIFIED:   "payment.society_fee.batch_verified",
  SOCIETY_FEE_BATCH_ACCEPTED:   "payment.society_fee.batch_accepted",

  // ─── Skill ───────────────────────────────────────────────────────────────
  SKILL_CREATED:                "skill.created",
  SKILL_UPDATED:                "skill.updated",
  SKILL_DELETED:                "skill.deleted",
  USER_SKILL_ADDED:             "skill.user_skill.added",
  USER_SKILL_BULK_ADDED:        "skill.user_skill.bulk_added",
  USER_SKILL_UPDATED:           "skill.user_skill.updated",
  USER_SKILL_DELETED:           "skill.user_skill.deleted",
});

module.exports = { ActivityAction };
