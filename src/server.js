import 'dotenv/config';

import app from './app.js';
import { getPort } from './utils/getPort.js';

const port = getPort(process.env.PORT, 4000);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
