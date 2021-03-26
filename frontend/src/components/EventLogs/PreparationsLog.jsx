import React from 'react';
import { Badge } from 'react-bootstrap';
import { logTypes } from './EventLogs';

import Log from './Log';
import Mitigations from '../Mitigations/Mitigations';

const PreparationsLog = () => (
  <Log
    title={
      <div className="d-flex align-items-center">
        00:00 -
        <Badge pill variant="dark" className="py-1 mx-1">
          {logTypes.Preparations}
        </Badge>
        Preparation Mitigations Selected
      </div>
    }
  >
    <Mitigations isLog className="card-body" />
  </Log>
);

export default PreparationsLog;
