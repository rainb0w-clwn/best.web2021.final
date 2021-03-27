import React, { useMemo } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { reduce as _reduce, map as _map } from 'lodash';
import { view } from '@risingstack/react-easy-state';

import AvailableActionItems from './AvailableActionItems';
import { useStaticData } from '../StaticDataProvider';

const ActionItems = view(({ className, location }) => {
  const { actions} = useStaticData();

  const actionsNew = useMemo(() => {
      return actions;
  }, [actions, location]);

    console.log(actionsNew);
  return (
    <Container className={className} id={`${location}_actions`}>
      <Row>
        <Col xs={12}>
          <h2 className="font-weight-bold mb-0">
            {location === 'user'
              ? 'USER ACTIONS:'
              : 'HQ ACTIONS AND SECURITY ACTIONS:'}
          </h2>
        </Col>
      </Row>
      {_map(actionsNew, (actions) => (
        <div className="my-5">
          <AvailableActionItems
            actionList={actionsNew}
          />
        </div>
      ))}
    </Container>
  );
});

export default ActionItems;
