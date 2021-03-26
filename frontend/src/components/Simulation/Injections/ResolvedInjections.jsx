import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';

import Injection from './Injection';

const ResolvedInjections = view(
  ({ className, resolvedInjections }) => (
    <Row className={className} id="resolved_injects">
      <Col xs={12}>
        <h2 className="font-weight-bold">RESOLVED EVENTS:</h2>
      </Col>
      <Col>
        {resolvedInjections.length
          ? resolvedInjections.map(
              ({
                injection,
                upcoming,
                canDeliver,
                canMakeResponse,
                prevented,
                delivered,
                isDanger,
                resolved,
                gameInjection,
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
                  resolved={resolved}
                  gameInjection={gameInjection}
                  isBackground={isBackground}
                />
              ),
            )
          : 'No event resolved.'}
      </Col>
    </Row>
  ),
);

export default ResolvedInjections;
