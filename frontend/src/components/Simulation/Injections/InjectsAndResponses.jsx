import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';

import Injection from './Injection';

const InjectsAndResponses = view(
  ({ className, injectionsToResponse }) => (
    <Row className={className} id="injects">
      <Col xs={12}>
        <h2 className="font-weight-bold">EVENTS AND RESPONSES:</h2>
      </Col>
      <Col>
        {injectionsToResponse.length
          ? injectionsToResponse.map(
              ({
                injection,
                upcoming,
                canDeliver,
                canMakeResponse,
                prevented,
                delivered,
                isDanger,
                isBackground,
              }) => (
                <Injection
                  injection={injection}
                  key={injection.id}
                  prevented={prevented}
                  delivered={delivered}
                  isDanger={isDanger}
                  upcoming={upcoming}
                  canDeliver={canDeliver}
                  canMakeResponse={canMakeResponse}
                  isBackground={isBackground}
                />
              ),
            )
          : 'No upcoming event.'}
      </Col>
    </Row>
  ),
);

export default InjectsAndResponses;
