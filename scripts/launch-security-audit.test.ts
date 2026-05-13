import { describe, expect, test } from "bun:test";

import {
  analyzeLaunchSecurity,
  parseGitHubErrorStatusCode,
  securityFeatureStatusFromMetadata,
  type RepositorySecurityEvidence,
} from "./launch-security-audit.js";

const publicWorld: RepositorySecurityEvidence = {
  name: "vivarium-world",
  private: false,
  visibility: "public",
  hasIssues: true,
  hasDiscussions: true,
  allowAutoMerge: true,
  deleteBranchOnMerge: true,
  dependabotSecurityUpdates: "enabled",
  privateVulnerabilityReporting: "enabled",
  secretScanning: "enabled",
  pushProtection: "enabled",
  dependabotAlerts: 0,
  secretScanningAlerts: 0,
  codeScanningAlerts: 0,
  branchProtection: "missing",
  rulesets: 0,
};

describe("launch security audit", () => {
  test("parses GitHub CLI status codes from common error formats", () => {
    expect(parseGitHubErrorStatusCode("gh: Branch not protected (HTTP 404)")).toBe(404);
    expect(parseGitHubErrorStatusCode('{"message":"Not Found","status":"404"}')).toBe(404);
    expect(parseGitHubErrorStatusCode("HTTP/2.0 403 Forbidden")).toBe(403);
  });

  test("treats unavailable security analysis metadata as unavailable feature status", () => {
    expect(securityFeatureStatusFromMetadata({ security_and_analysis: null }, "secret_scanning")).toBe(
      "unavailable",
    );
  });

  test("requires a branch protection or ruleset decision for the public world", () => {
    expect(analyzeLaunchSecurity(publicWorld)).toEqual({
      ok: false,
      blockers: [],
      manualDecisions: ["vivarium-world.branchProtectionOrRulesets:decision-required"],
    });
  });

  test("passes when security signals are clean and a protection decision is recorded", () => {
    expect(analyzeLaunchSecurity({ ...publicWorld, branchProtection: "enabled" })).toEqual({
      ok: true,
      blockers: [],
      manualDecisions: [],
    });
  });

  test("blocks launch for disabled or unavailable public security signals", () => {
    const audit = analyzeLaunchSecurity({
      ...publicWorld,
      privateVulnerabilityReporting: "disabled",
      secretScanningAlerts: "unavailable",
      codeScanningAlerts: 2,
    });

    expect(audit.ok).toBe(false);
    expect(audit.blockers).toEqual(
      expect.arrayContaining([
        "vivarium-world.privateVulnerabilityReporting:disabled",
        "vivarium-world.secretScanningAlerts:unavailable",
        "vivarium-world.codeScanningAlerts:2",
      ]),
    );
  });
});
