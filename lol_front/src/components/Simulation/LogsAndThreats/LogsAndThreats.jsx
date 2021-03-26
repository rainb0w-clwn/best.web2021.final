import React from 'react';

import Threats from './Threats';
import EventLogs from '../../EventLogs/EventLogs';

const ActionTable = () => (
  <>
    <Threats className="my-5" />
    <EventLogs className="my-5 pb-5" asc={false} />
  </>
);

export default ActionTable;
