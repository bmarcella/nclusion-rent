/* eslint-disable @typescript-eslint/no-unused-vars */
import { createService, DEvent } from '@App/damba.import';

const api = createService('/mail');
api.DPost(
  '/',
  async (e: DEvent) => {
    const data = e.in.body;

    const batches = [];

    for (let i = 0; i < data.contents.length; i++) {
      const batch = {
        from: data.from,
        subject: data.subject,
        to: data.contents[i].to,
        html: data.contents[i].html
      };
      console.log(batch);
      batches.push(batch);
    }

    const results = await e.in.resend.batch.send(batches)
    return e.out.json({ message: "Sending email is in process!", error: false, batches, data, results });
  },
  {
    async sendEmail(e: DEvent, data) {


    }

  },
);

export default api.done();
