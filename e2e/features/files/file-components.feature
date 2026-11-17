# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: File entries in a list or grid

  A folder or a file is shown as a row or a card with its type icon, name,
  size and last change. The same entry reads the same in the light and the
  dark theme, and a long name stays readable in full on request.

  @wip
  Scenario: A folder is listed with its name and number of items
    Given a family with a folder "Holiday photos" holding 184 items
    When I open the file browser
    Then I see the folder "Holiday photos" with "184 items"

  @wip
  Scenario: A file is listed with its name, size and last change
    Given a family with a file "Insurance policy.pdf" of 2.8 MB changed yesterday
    When I open the file browser
    Then I see the file "Insurance policy.pdf" with "2.8 MB" and "Yesterday"

  @wip
  Scenario: A long file name is shortened but readable in full on request
    Given a family with a file with a very long name
    When I open the file browser on a 375 px wide screen
    Then the file name is shortened to fit on one line
    And the full file name is available on request

  @wip
  Scenario Outline: Each kind of file shows its own type icon
    Given a family with a file of type "<file type>"
    When I open the file browser
    Then the file shows the "<kind>" icon

    Examples:
      | file type          | kind        |
      | photo              | Image       |
      | text document      | Document    |
      | spreadsheet        | Spreadsheet |
      | PDF document       | PDF         |
      | zip archive        | Archive     |
      | audio recording    | Audio       |
      | video clip         | Video       |
      | unknown file type  | File        |

  @wip
  Scenario: A selected file is visibly marked as selected
    Given a family with a file "Insurance policy.pdf"
    When I select the file "Insurance policy.pdf"
    Then the file "Insurance policy.pdf" is marked as selected

  @wip
  Scenario: A file is opened with the keyboard
    Given a family with a file "Insurance policy.pdf"
    When I focus the file "Insurance policy.pdf" and press Enter
    Then the file "Insurance policy.pdf" is opened

  @wip
  Scenario: A file entry is readable in the dark theme
    Given a family with a file "Insurance policy.pdf" of 2.8 MB
    When I open the file browser in the dark theme
    Then I see the file "Insurance policy.pdf" with "2.8 MB"

  @wip @a11y
  Scenario: A file entry passes the accessibility check
    Given a family with a file "Insurance policy.pdf" and a folder "Holiday photos"
    When I open the file browser
    Then the file browser has no accessibility violations
