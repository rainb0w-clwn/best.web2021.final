import React, { useMemo } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';

import Log from './Log';
import { useStaticData } from '../StaticDataProvider';
import { msToMinutesSeconds, numberToUsd } from '../../util';

const CurveballEventLog = ({ game_timer, type, curveball_id }) => {
  const { curveballs } = useStaticData();
  const curveball = useMemo(() => curveballs[curveball_id], [
    curveballs,
    curveball_id,
  ]);

  return (
    <Log
      title={
        <div className="d-flex align-items-center">
          {`${msToMinutesSeconds(game_timer)} -`}
          <Badge
            pill
            variant="warning"
            className="py-1 mx-1 text-white"
          >
            {type}
          </Badge>
          {curveball.description}
        </div>
      }
    >
      <Card.Body>
        <Row>
          <Col>{curveball.description}</Col>
          {!!curveball.poll_change && (
            <Col xs={2} className="text-right">
              <span className="font-weight-bold">Poll: </span>
              {curveball.poll_change}%
            </Col>
          )}
          {(!!curveball.budget_change ||
            curveball.lose_all_budget) && (
            <Col xs={2} className="text-right">
              <span className="font-weight-bold">Budget: </span>
              {curveball.lose_all_budget
                ? 'Party loses all its money'
                : numberToUsd(curveball.budget_change)}
            </Col>
          )}
        </Row>
      </Card.Body>
    </Log>
  );
};

export default CurveballEventLog;
