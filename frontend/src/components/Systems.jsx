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

    </Row>
  );
});

export default Systems;
