// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Checkbox, Text } from "@offgrid/ui";
import { GuestName } from "../../../guest-name/guest-name.js";
import { groupCandidatesByFamily } from "../../../group-candidates-by-family.js";
import { guestFamilyNameStyle, guestOptionsStyle } from "./styles.js";
import type { CandidateOptionsProps } from "./types.js";

export const CandidateOptions = ({ candidates, selectedIds, onToggle }: CandidateOptionsProps) => {
  return (
    <div style={guestOptionsStyle}>
      {groupCandidatesByFamily(candidates).map((group) => (
        <div key={group.familyName}>
          <span style={guestFamilyNameStyle}>
            <Text variant="caption" value={group.familyName} />
          </span>
          {group.candidates.map((candidate) => (
            <Checkbox
              key={candidate.userId}
              data-testid={`guest-option-${candidate.userId}`}
              checked={selectedIds.includes(candidate.userId)}
              onChange={() => onToggle(candidate.userId)}
              label={<GuestName name={candidate.name} />}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
