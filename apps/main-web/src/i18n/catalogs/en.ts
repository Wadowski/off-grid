// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const en = {
  appName: "Offgrid",
  navLabel: "Main navigation",
  nav: {
    family: "Family",
    settings: "Settings",
  },
  userMenu: {
    trigger: "Account menu",
    label: "Account",
    roleAdmin: "Admin",
    roleMember: "Member",
    accountAndSecurity: "Account and security",
    adminSettings: "Admin settings",
    signOut: "Sign out",
  },
  families: {
    heading: "Families",
    createHeading: "Create family",
    nameLabel: "Family name",
    submit: "Create family",
    nameRequired: "Enter a family name.",
    nameTooLong: "Use 100 characters or fewer.",
    createFailed: "The family could not be created. Try again.",
    listHeading: "Your families",
    loading: "Loading families…",
    listFailed: "Your families could not be loaded.",
    empty: "You are not in any family yet.",
  },
  errors: {
    unexpected: "Something went wrong.",
    retry: "Try again",
  },
  session: {
    loading: "Loading…",
    signedOut: "You were signed out",
  },
  authLayout: {
    footer: "Offgrid runs on your own network.",
  },
  signIn: {
    heading: "Sign in",
  },
  createAccount: {
    heading: "Create account",
  },
  authPlaceholder: {
    notReady: "This screen is not ready yet.",
  },
} as const;
