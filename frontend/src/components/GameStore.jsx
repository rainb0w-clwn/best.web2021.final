import qs from 'query-string';
import { store } from '@risingstack/react-easy-state';
import io from 'socket.io-client';
import { keyBy as _keyBy } from 'lodash';
import { GameStates } from '../constants';

import { SocketEvents } from '../constants';

const socket = io(process.env.REACT_APP_API_URL);

export const gameStore = store({
  loading: false,

  // ERROR
  errorTimer: null,
  error: {
    message: '',
    show: false,
  },
  closeError: () => (gameStore.error.show = false),
  popError: (errorMessage) => {
    gameStore.error = { message: errorMessage, show: true };
    if (gameStore.errorTimer) {
      clearTimeout(gameStore.errorTimer);
    }
    gameStore.errorTimer = setTimeout(() => {
      gameStore.closeError();
    }, 4000);
  },

  // INFO
  infoTimer: null,
  info: {
    message: '',
    show: false,
  },
  closeInfo: () => (gameStore.info.show = false),
  popInfo: (infoMessage) => {
    gameStore.info = { message: infoMessage, show: true };
    if (gameStore.infoTimer) {
      clearTimeout(gameStore.infoTimer);
    }
    gameStore.infoTimer = setTimeout(() => {
      gameStore.closeInfo();
    }, 4000);
  },

  // HELPERS
  setGame: (game) => {
    Object.keys(game).forEach((key) => {
      if (key === 'azs') {
        gameStore.azs = _keyBy(
            game.azs,
            'id',
        );
      } else if (key === 'staff') {
        gameStore.staff = _keyBy(
            game.staff,
            'id',
        );
      } else if (key === 'tunker') {
        gameStore.injections = _keyBy(
            game.tunker,
            'id',
        );
      }
      else if (key === 'monthDistribution') {
        gameStore.monthDistribution = {...game.monthDistribution};
      } else {
        gameStore[key] = game[key];
      }
    });
  },
  emitEvent: (event, params, successInfo) =>
    params
      ? socket.emit(event, params, ({ error }) => {
          if (error) {
            gameStore.popError(error);
          } else if (successInfo) {
            gameStore.popInfo(successInfo);
          }
        })
      : socket.emit(event, ({ error }) => {
          if (error) {
            gameStore.popError(error);
          } else if (successInfo) {
            gameStore.popInfo(successInfo);
          }
        }),

  // ACTIONS
  actions: {
    enterGame: ({ eventType, gameId, monthDistribution, rememberGameId }) => {
      gameStore.loading = true;
      socket.emit(eventType, gameId, monthDistribution, ({ error, game }) => {
        if (!error) {
          gameStore.setGame(game);
          if (rememberGameId) {
            localStorage.setItem('gameId', gameId);
          } else {
            localStorage.removeItem('gameId');
          }
        } else {
          gameStore.popError(error);
        }
        gameStore.loading = false;
      });
    },
    resumeSimulation: () =>
      gameStore.emitEvent(SocketEvents.STARTSIMULATION),
    pauseSimulation: () =>
      gameStore.emitEvent(SocketEvents.PAUSESIMULATION),
    finishSimulation: () =>
      gameStore.emitEvent(SocketEvents.FINISHSIMULATION),
    toggleMitigation: (params, showInfo = false) =>
      gameStore.emitEvent(
        SocketEvents.CHANGEMITIGATION,
        params,
        ...(showInfo ? ['Item bought'] : []),
      ),
    performAction: (params) => {
        console.log(params);
      gameStore.emitEvent(
        SocketEvents.PERFORMACTION,
        params,
        'Action Performed',
      )},
    performCurveball: (params) =>
      gameStore.emitEvent(
        SocketEvents.PERFORMCURVEBALL,
        params,
        'Curveball Performed',
      ),
    restoreSystem: (params) =>
      gameStore.emitEvent(
        SocketEvents.RESTORESYSTEM,
        params,
        'System Restored',
      ),
    startSimulation: () =>
      gameStore.emitEvent(SocketEvents.STARTSIMULATION),
    deliverInjection: (params) =>
      gameStore.emitEvent(SocketEvents.DELIVERINJECTION, params),
    respondToInjection: (params) =>
      gameStore.emitEvent(
        SocketEvents.RESPONDTOINJECTION,
        params,
        'Response made',
      ),
    nonCorrectRespondToInjection: (params) =>
      gameStore.emitEvent(
        SocketEvents.NONCORRECTRESPONDTOINJECTION,
        params,
        'Response made',
      ),
  },
});

socket.on(SocketEvents.CONNECT, () => {
  gameStore.socketConnected = true;
});

let timerId = setTimeout(function tick() {
  let lol = {...gameStore}
  if (lol.state === GameStates.SIMULATION) {
    socket.emit(SocketEvents.UPDATEGAME)
    timerId = setTimeout(tick, 500); // (*)
  } else {
    timerId = setTimeout(tick, 2000); // (*)
  }
}, 1000);

// LISTEN TO GAME STATE UPDATES
socket.on(SocketEvents.GAMEUPDATED, (g) => gameStore.setGame(g));
// RECONNECT GAME ROOM IF CONNECTION LOST
socket.on(SocketEvents.RECONNECT, () => {
  if (gameStore.id) {
    socket.emit(
      SocketEvents.JOINGAME,
      gameStore.id,
      ({ error, game: g }) => {
        if (!error) {
          gameStore.setGame(g);
        }
        gameStore.popError(error);
      },
    );
  }
});

// AUTO JOIN GAME FORM QUERY PARAMS
const { gameId: gameIdFromQuery, ...newParams } = qs.parse(
  window.location.search,
);
if (gameIdFromQuery) {
  gameStore.loading = true;
  socket.emit(
    SocketEvents.JOINGAME,
    gameIdFromQuery,
    null,
    ({ error, game }) => {
      if (!error) {
        gameStore.setGame(game);
        window.history.replaceState(
          null,
          null,
          `?${qs.stringify(newParams)}`,
        );
        localStorage.setItem('gameId', gameIdFromQuery);
      } else {
        gameStore.loading = false;
      }
    },
  );
}
