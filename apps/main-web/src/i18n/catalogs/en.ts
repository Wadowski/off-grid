// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const en = {
  appName: "Offgrid",
  navPlaceholder: "Modules will appear here.",
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
    waitingForList: "Saving… the family will appear shortly.",
    listFailed: "Your families could not be loaded.",
    empty: "You are not in any family yet.",
  },
  errors: {
    unexpected: "Something went wrong.",
    retry: "Try again",
  },
} as const;
