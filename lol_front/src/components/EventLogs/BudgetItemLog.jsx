import React, { useMemo } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';

import Log from './Log';
import { useStaticData } from '../StaticDataProvider';
import { msToMinutesSeconds, numberToUsd } from '../../util';

const BudgetItemLog = ({
  game_timer,
  type,
  mitigation_type,
  mitigation_id,
}) => {
  const { mitigations } = useStaticData();
  const mitigation = useMemo(() => mitigations[mitigation_id], [
    mitigations,
    mitigation_id,
  ]);

  return (
    <Log
      title={
        <div className="d-flex align-items-center">
          {`${msToMinutesSeconds(game_timer)} -`}
          <Badge pill variant="secondary" className="py-1 mx-1">
            {type}
          </Badge>
          {mitigation.category}
        </div>
      }
    >
      <Card.Body>
        <Row>
          <Col xs={8}>{mitigation.description}</Col>
          <Col xs={2}>
            <span className="font-weight-bold">Location: </span>
            <span className="text-uppercase">{mitigation_type}</span>
          </Col>
          <Col xs={2} className="text-right">
            <span className="font-weight-bold">Cost: </span>
            {numberToUsd(mitigation[`${mitigation_type}_cost`])}
          </Col>
        </Row>
      </Card.Body>
    </Log>
  );
};

export default BudgetItemLog;
