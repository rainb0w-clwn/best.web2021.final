import React from 'react';
import { view } from '@risingstack/react-easy-state';
import { Alert } from 'react-bootstrap';

import { gameStore } from './GameStore';

const ErrorBox = view(() => (
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
      show={gameStore.error.show}
      variant="danger"
      onClose={gameStore.closeError}
      dismissible
    >
      {gameStore.error.message}
    </Alert>
  </div>
));

export default ErrorBox;
