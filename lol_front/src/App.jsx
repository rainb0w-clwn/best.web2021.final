import React from 'react';
import { view } from '@risingstack/react-easy-state';

import Game from './components/Game';
import ErrorBox from './components/ErrorBox';
import InfoBox from './components/InfoBox';
import { StaticDataProvider } from './components/StaticDataProvider';

const App = view(() => (
  <StaticDataProvider>
    <ErrorBox />
    <InfoBox />
    <Game />
  </StaticDataProvider>
));

export default App;
