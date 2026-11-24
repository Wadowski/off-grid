# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

@module:files @ui
Feature: Grid view and sort order of the desktop Files page

  On a desktop screen the entries of a drive or folder can be shown as a list
  or as a grid of cards. The entries can be sorted by name, last change or size,
  in either direction, and folders always come first. The chosen view and sort
  are remembered for the viewer. The selected file and the loaded pages stay
  the same when the view changes.

  @screen:files-desktop-grid
  Scenario: The grid shows each entry as a card, folders first
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive folder "Archive"
    And Anna has a personal-drive file "Insurance policy.txt"
    And Anna has a personal-drive file "Notes.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    Then the grid shows the folder cards "Photos" and "Archive" above the file cards "Insurance policy.txt" and "Notes.txt"

  Scenario: The grid keeps a clear gap between the folders and the files
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive folder "Archive"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    Then the grid shows the folders and the files as separate groups with space between them

  Scenario: The grid lists folders first under every sort
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Small.txt" of 100 bytes
    And Anna has a personal-drive file "Large.txt" of 9000 bytes
    And Anna has a personal-drive folder "Zulu"
    And Anna has a personal-drive folder "Alpha"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna sorts the entries by size
    Then the grid shows the cards "Alpha", "Zulu", "Small.txt" and "Large.txt" in that order
    When Anna reverses the sort direction
    Then the grid shows the cards "Zulu", "Alpha", "Large.txt" and "Small.txt" in that order

  Scenario: The list lists folders first under every sort
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Small.txt" of 100 bytes
    And Anna has a personal-drive file "Large.txt" of 9000 bytes
    And Anna has a personal-drive folder "Zulu"
    And Anna has a personal-drive folder "Alpha"
    When Anna opens the files page on a desktop screen
    And Anna sorts the entries by modified date
    Then the table rows read "Zulu", "Alpha", "Small.txt" and "Large.txt" in that order
    When Anna reverses the sort direction
    Then the table rows read "Alpha", "Zulu", "Large.txt" and "Small.txt" in that order

  Scenario: Loading more entries in the grid extends the file group
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Archive" holding 51 files of increasing size
    And Anna has a folder "Scans" inside the folder "Archive"
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Archive" from the table
    And Anna switches the view to grid
    And Anna sorts the entries by size
    And Anna reverses the sort direction
    And Anna loads more entries
    Then the grid shows the folder cards "Scans" above 51 file cards
    And the last grid file card is "File 01"

  Scenario: Switching back to the list shows the table again
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna switches the view to list
    Then the table row "Insurance policy.txt" is shown

  Scenario: The selected file stays selected when the view changes
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive file "Zulu.txt"
    When Anna opens the files page on a desktop screen
    And Anna selects the table row "Zulu.txt"
    And Anna switches the view to grid
    Then the grid card "Zulu.txt" is selected
    And the grid card "Alpha.txt" is not selected

  Scenario: Opening a folder card enters the folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Holiday.txt" in the folder "Photos"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna opens the folder "Photos" from the grid
    Then the folder path reads "Personal" and "Photos"
    And the grid shows the card "Holiday.txt"

  @screen:files-desktop-sorted-by-size
  Scenario: Sorting by size orders the files by size and keeps folders first
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Medium.txt" of 2000 bytes
    And Anna has a personal-drive file "Small.txt" of 100 bytes
    And Anna has a personal-drive file "Large.txt" of 9000 bytes
    And Anna has a personal-drive folder "Yankee"
    When Anna opens the files page on a desktop screen
    And Anna sorts the entries by size
    Then the table rows read "Yankee", "Small.txt", "Medium.txt" and "Large.txt" in that order

  Scenario: Reversing the sort direction reverses the order of the entries
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Medium.txt" of 2000 bytes
    And Anna has a personal-drive file "Small.txt" of 100 bytes
    When Anna opens the files page on a desktop screen
    And Anna sorts the entries by size
    And Anna reverses the sort direction
    Then the table rows read "Medium.txt" and "Small.txt" in that order

  Scenario: Sorting by last change orders the files by the time they changed
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Older.txt"
    And Anna has a personal-drive file "Newer.txt"
    When Anna opens the files page on a desktop screen
    And Anna sorts the entries by modified date
    Then the table rows read "Older.txt" and "Newer.txt" in that order
    When Anna reverses the sort direction
    Then the table rows read "Newer.txt" and "Older.txt" in that order

  Scenario: The sort holds across pages in a big folder
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Archive" holding 51 files of increasing size
    When Anna opens the files page on a desktop screen
    And Anna opens the folder "Archive" from the table
    And Anna sorts the entries by size
    And Anna reverses the sort direction
    And Anna loads more entries
    Then the table shows 51 rows
    And the table row "File 01" is the last row

  Scenario: The chosen view and sort are remembered after a reload
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt" of 2000 bytes
    And Anna has a personal-drive file "Zulu.txt" of 100 bytes
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    And Anna sorts the entries by size
    And Anna reloads the page
    Then the grid shows the cards "Zulu.txt" and "Alpha.txt"
    And the sort control shows "Size"

  Scenario: The page works with the default view when browser storage is blocked
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    And Anna has a personal-drive file "Zulu.txt"
    And the browser blocks its local storage
    When Anna opens the files page on a desktop screen
    Then the table rows read "Alpha.txt" and "Zulu.txt" in that order
    And the sort control shows "Name"

  @a11y
  Scenario: The grid and the view controls have no serious accessibility violations
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive folder "Photos"
    And Anna has a personal-drive file "Insurance policy.txt"
    When Anna opens the files page on a desktop screen
    And Anna switches the view to grid
    Then the page has no serious accessibility violations

  @a11y
  Scenario: The view and the sort can be changed with the keyboard
    Given I am signed in as "Anna Kowalska", a regular member
    And Anna has a personal-drive file "Alpha.txt"
    When Anna opens the files page on a desktop screen
    And Anna reaches the grid view option with the keyboard and presses Space
    Then the grid shows the card "Alpha.txt"
    When Anna reaches the sort direction control with the keyboard and presses Enter
    Then the sort direction reads "descending"
