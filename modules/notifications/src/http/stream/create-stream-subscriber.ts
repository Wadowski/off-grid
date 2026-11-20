// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import type { ListedNotification, NoticeSubscriber } from "../../types.js";
import { formatNoticeFrame } from "./format-notice-frame.js";

const waitForDrain = (response: ServerResponse): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const onDrain = (): void => {
      response.off("close", onClose);
      resolve();
    };
    const onClose = (): void => {
      response.off("drain", onDrain);
      reject(new Error("notification stream closed"));
    };
    response.once("drain", onDrain);
    response.once("close", onClose);
  });

export const createStreamSubscriber = (
  response: ServerResponse,
  endStream: () => void,
): NoticeSubscriber => ({
  send: async (notice: ListedNotification): Promise<void> => {
    if (response.destroyed || response.writableEnded) {
      throw new Error("notification stream closed");
    }
    if (!response.write(formatNoticeFrame(notice))) {
      await waitForDrain(response);
    }
  },
  close: endStream,
});
