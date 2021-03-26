import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { AiOutlineStop, AiOutlineCheck } from 'react-icons/ai';
import { view } from '@risingstack/react-easy-state';
import { map as _map } from 'lodash';
import classNames from 'classnames';

import { gameStore } from './GameStore';
import { useStaticData } from './StaticDataProvider';

const Systems = view(({ className, centerHeader, big }) => {
  const { systems: gameSystems } = gameStore;
  const { systems } = useStaticData();

  return (
    <Row className={className} id="systems">
      <Col
        xs={12}
        className={classNames({
          'd-flex justify-content-center': centerHeader,
        })}
      >
        <h2 className="font-weight-bold">TECHNICAL SYSTEMS:</h2>
      </Col>
      {systems ? (
        _map(systems, (system) => (
          <Col
            xs={6}
            md={4}
            className="d-flex align-items-center mb-4"
            key={system.id}
          >
            {gameSystems[system.id] ? (
              <AiOutlineCheck
                className="text-success"
                fontSize={big ? '40px' : '30px'}
              />
            ) : (
              <AiOutlineStop
                className="text-danger"
                fontSize={big ? '40px' : '30px'}
              />
            )}
            {big ? (
              <h4 className="ml-2 text-uppercase font-weight-normal mb-0 col p-0">
                {system.name}
              </h4>
            ) : (
              <h5 className="ml-2 text-uppercase font-weight-normal mb-0 col p-0">
                {system.name}
              </h5>
            )}
          </Col>
        ))
      ) : (
        <Col xs={12} className="d-flex justify-content-center">
          <Spinner animation="border" />
        </Col>
      )}
    </Row>
  );
});

export default Systems;
