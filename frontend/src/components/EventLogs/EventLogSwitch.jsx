import React, { useMemo } from 'react';
import { view } from '@risingstack/react-easy-state';
import { Badge } from 'react-bootstrap';

import { logTypes } from './EventLogs';
import CampaignActionLog from './CampaignActionLog';
import Log from './Log';
import { msToMinutesSeconds } from '../../util';

const EventLogSwitch = view(
  ({
    log: {
      game_timer,
      description,
      type,
      action_id,
    },
    filter,
  }) => {
    const shouldDisplay = useMemo(() => filter[type] || false, [
      filter,
      type,
    ]);

    const eventLog = useMemo(() => {
      switch (type) {
        case logTypes.CampaignAction:
          return (
            <CampaignActionLog
              game_timer={game_timer}
              type={type}
              action_id={action_id}
            />
          );
        case logTypes.GameState:
          return (
            <Log
              title={
                <div className="d-flex align-items-center">
                  {`${msToMinutesSeconds(game_timer)} -`}
                  <Badge pill variant="primary" className="py-1 mx-1">
                    {type}
                  </Badge>
                  {description}
                </div>
              }
            />
          );
        default:
          return null;
      }
    }, [
      type,
      game_timer,
      action_id,
      description,
    ]);

    return shouldDisplay && eventLog;
  },
);

export default EventLogSwitch;
