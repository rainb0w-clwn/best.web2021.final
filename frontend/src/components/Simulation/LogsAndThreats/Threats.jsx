import React, { useMemo } from 'react';
import { Row, Col, Spinner, Card } from 'react-bootstrap';
import { reduce as _reduce } from 'lodash';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { view } from '@risingstack/react-easy-state';

import { gameStore } from '../../GameStore';
import { msToMinutesSeconds } from '../../../util';
import { useStaticData } from '../../StaticDataProvider';

const Threats = view(({ className }) => {
  const { injections: gameInjections } = gameStore;
  const { injections } = useStaticData();

  const { threats, notThreats } = useMemo(
    () =>
      injections
        ? _reduce(
            injections,
            (
              acc,
              {
                trigger_time: triggerTime,
                title,
                id,
                location,
                prevented,
              },
            ) => {
              if (gameInjections[id].prevented) {
                acc.notThreats.push({
                  desc:
                    msToMinutesSeconds(triggerTime) +
                    ' - ' +
                    (title || id),
                  location: location?.toUpperCase() || 'PARTY',
                });
                return acc;
              }
              acc.threats.push({
                desc:
                  msToMinutesSeconds(triggerTime) +
                  ' - ' +
                  (title || id),
                location: location?.toUpperCase() || 'PARTY',
              });
              return acc;
            },
            {
              threats: [],
              notThreats: [],
            },
          )
        : {
            threats: [],
            notThreats: [],
          },
    [gameInjections, injections],
  );

  return (
    <Row className={className} id="threats">
      <Col lg={6} className="mb-4 mb-lg-0">
        <Card
          className="h-100 border-primary threats"
          style={{ borderRadius: '1rem' }}
        >
          <Card.Header
            as="h3"
            className="border-primary bg-white"
            style={{ borderRadius: '1rem 1rem 0 0' }}
          >
            MITIGATED THREATS:
          </Card.Header>
          <Card.Body className="pb-3 threats-body">
            {!!notThreats.length
              ? notThreats.map(({ desc, location }, i) => (
                  <Row
                    key={i}
                    className="d-flex align-items-center py-1 justify-content-between select-row"
                  >
                    <Col xs={10}>
                      <AiOutlineCheck
                        className="mr-2"
                        fontSize="20px"
                      />
                      {desc}
                    </Col>
                    <Col
                      xs={2}
                      className="text-right"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {location}
                    </Col>
                  </Row>
                ))
              : 'No threat mitigated.'}
            {!injections && (
              <Col xs={12} className="d-flex justify-content-center">
                <Spinner animation="border" />
              </Col>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col lg={6}>
        <Card
          className="h-100 border-primary threats"
          style={{ borderRadius: '1rem' }}
        >
          <Card.Header
            as="h3"
            className="border-primary bg-white"
            style={{ borderRadius: '1rem 1rem 0 0' }}
          >
            NOT MITIGATED THREATS:
          </Card.Header>
          <Card.Body className="pb-3 threats-body">
            {!!threats.length
              ? threats.map(({ desc, location }, i) => (
                  <Row
                    key={i}
                    className="d-flex align-items-center py-1 justify-content-between select-row"
                  >
                    <Col xs={10}>
                      <AiOutlineClose
                        className="mr-2"
                        fontSize="20px"
                      />
                      {desc}
                    </Col>
                    <Col
                      xs={2}
                      className="text-right"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {location}
                    </Col>
                  </Row>
                ))
              : 'Every threat mitigated.'}
            {!injections && (
              <Col xs={12} className="d-flex justify-content-center">
                <Spinner animation="border" />
              </Col>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
});

export default Threats;
