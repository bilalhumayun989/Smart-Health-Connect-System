const fs = require('fs');
const path = require('path');
// Preview is read-only. Applying a reset requires explicit --apply --database=<name>.
require('./scripts/reset-demo-data');
