import React, { useMemo, useState } from 'react';
import {
  Row,
  Col,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
import { view, store } from '@risingstack/react-easy-state';
import { orderBy as _orderBy} from 'lodash';

import { useStaticData } from '../StaticDataProvider';
import { gameStore } from '../GameStore';
import EventLogSwitch from './EventLogSwitch';

export const accordionOpeners = store([]);

export const logTypes = {
  CampaignAction: 'Campaign Action',
  GameState: 'Game State Changed',
};

const EventLogs = view(({ className, asc = true }) => {
  const { logs: gameLogs} = gameStore;

  const logs = useMemo(() => {
    return _orderBy(
      [...gameLogs],
      'game_timer',
      asc ? 'asc' : 'desc',
    );
  }, [gameLogs, asc]);

  const [filterValue, setFilterValue] = useState(
    Object.values(logTypes),
  );
  const filter = useMemo(
    () =>
      filterValue.reduce(
        (acc, logType) => ({ ...acc, [logType]: true }),
        {},
      ),
    [filterValue],
  );

  return (
    <Row className={className} id="logs">
      <Col xs={4} className="pr-1">
        <h2 className="font-weight-bold">EVENTS LOG:</h2>
      </Col>
      <Col xs={2} className="px-1">
        <Button
          variant="outline-primary"
          className="rounded-pill w-100 d-flex justify-content-center"
          type="button"
          style={{ whiteSpace: 'nowrap' }}
          onClick={() => setFilterValue(Object.values(logTypes))}
        >
          SHOW ALL
        </Button>
      </Col>
      <Col xs={2} className="px-1">
        <Button
          variant="outline-primary"
          className="rounded-pill w-100 d-flex justify-content-center"
          type="button"
          onClick={() => setFilterValue([])}
        >
          HIDE ALL
        </Button>
      </Col>
      <Col xs={2} className="px-1">
        <Button
          variant="outline-primary"
          className="rounded-pill w-100 d-flex justify-content-center"
          style={{ whiteSpace: 'nowrap' }}
          type="button"
          onClick={() =>
            accordionOpeners.forEach((openAccordion) =>
              openAccordion(false),
            )
          }
        >
          CLOSE ALL
        </Button>
      </Col>
      <Col xs={2} className="pl-1">
        <Button
          variant="outline-primary"
          className="rounded-pill w-100 d-flex justify-content-center"
          style={{ whiteSpace: 'nowrap' }}
          type="button"
          onClick={() =>
            accordionOpeners.forEach((openAccordion) =>
              openAccordion(true),
            )
          }
        >
          EXPAND ALL
        </Button>
      </Col>
      <Col xs={12}>
        <ToggleButtonGroup
          type="checkbox"
          value={filterValue}
          onChange={setFilterValue}
          className="d-flex log-filter"
          style={{ zIndex: 0 }}
        >
          <ToggleButton
            value={logTypes.CampaignAction}
            variant="outline-primary"
            className="p-1 d-flex align-items-center justify-content-center mr-1 rounded"
          >
            {logTypes.CampaignAction}
          </ToggleButton>
          <ToggleButton
            value={logTypes.GameState}
            variant="outline-primary"
            className="p-1 d-flex align-items-center justify-content-center mr-1 rounded"
          >
            {logTypes.GameState}
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
      <Col xs={12}>
        {logs.map((log) => (
          <EventLogSwitch log={log} key={log.id} filter={filter} />
        ))}
      </Col>
    </Row>
  );
});

export default EventLogs;
