import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Alert } from 'react-bootstrap';

import { gameStore } from './GameStore';

const InfoBox = view(() => (
  <div
    className="position-fixed"
    style={{
      bottom: '60px',
      left: '50%',
      transform: 'translate(-50%)',
      zIndex: 999,
    }}
  >
    <Alert
      show={gameStore.info.show}
      variant="info"
      onClose={gameStore.closeInfo}
      dismissible
    >
      {gameStore.info.message}
    </Alert>
  </div>
));

export default InfoBox;
