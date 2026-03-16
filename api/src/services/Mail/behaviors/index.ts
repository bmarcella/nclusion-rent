/* eslint-disable @typescript-eslint/no-unused-vars */

import { createService, DEvent } from "../../../damba.import";

const api = createService('/mail');

api.DPost(
  '/',
  async (e: DEvent) => {
     const { from, subject, contents } = e.in.body;

  if (!Array.isArray(contents) || contents.length === 0) {
    return e.out.json({
      error: true,
      message: "No email contents provided",
    });
  }

  const batches = contents.map(({ to, html }) => ({
    from,
    subject,
    to,
    html,
  }));

  const results = await e.in.resend.batch.send(batches);
  return e.out.json({
    error: false,
    message: "Email delivery is in progress.",
    count: batches.length,
    results,
  });
  },
  {
    
  },
);

export default api.done();
