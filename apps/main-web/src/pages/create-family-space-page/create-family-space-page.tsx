// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useNavigate, useOutletContext } from "react-router-dom";
import { CreateFamilySpaceForm } from "../../forms/create-family-space-form/create-family-space-form.js";
import type { FamiliesContext } from "../../types.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { createFamilySpacePageStyle } from "./styles.js";

export const CreateFamilySpacePage = () => {
  const { createStatus, submitFamily } = useOutletContext<FamiliesContext>();
  const navigate = useNavigate();

  const createSpace = async (name: string) => {
    const created = await submitFamily(name);
    if (created) {
      navigate("/settings/families");
    }
    return created;
  };

  return (
    <div style={createFamilySpacePageStyle}>
      <AccountIntro
        icon="diversity_3"
        pillTextId="firstFamily.pill"
        headingTextId="firstFamily.heading"
        bodyTextId="firstFamily.body"
      />
      <CreateFamilySpaceForm status={createStatus} onSubmit={createSpace} />
    </div>
  );
};
