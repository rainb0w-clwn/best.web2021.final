const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
  createGame,
  getGame,
  performAction,
  startSimulation,
  pauseSimulation,
} = require('./models/game');

module.exports = (http) => {
  const io = socketio(http);

  io.on(SocketEvents.CONNECT, (socket) => {
    logger.info('Facilitator CONNECT');
    let gameId = null;

    socket.on(SocketEvents.DISCONNECT, () => {
      logger.info('Facilitator DISCONNECT');
    });

    socket.on(SocketEvents.CREATEGAME, async (id, monthDistribution, callback) => {
      logger.info('CREATEGAME: %s', id);
      try {
        monthDistribution = monthDistribution.split(',')
        for(let i=0; i<monthDistribution.length; i++) { monthDistribution[i] = parseInt(monthDistribution[i], 10); }
        const game = await createGame(id, monthDistribution);
        if (gameId) {
          await socket.leave(gameId);
        }
        await socket.join(id);
        gameId = id;
        callback({game});
      } catch (_) {
        callback({error: 'Game id already exists!'});
        console.error(_);
      }
    });

    socket.on(SocketEvents.JOINGAME, async (id, callback) => {
      logger.info('JOINGAME: %s', id);
      try {
        const game = await getGame(id);
        if (!game) {
          callback({error: 'Game not found!'});
        }
        if (gameId) {
          await socket.leave(gameId);
        }
        await socket.join(id);
        gameId = id;
        callback({game});
      } catch (error) {
        logger.error('JOINGAME ERROR: %s', error);
        callback({error: 'Server error on join game!'});
      }
    });

    socket.on(SocketEvents.STARTSIMULATION, async (callback) => {
      logger.info('STARTSIMULATION: %s', gameId);
      try {
        const game = await startSimulation(gameId);
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({game});
      } catch (error) {
        callback({error: error.message});
      }
    });

    socket.on(SocketEvents.PAUSESIMULATION, async (callback) => {
      logger.info('PAUSESIMULATION: %s', gameId);
      try {
        const game = await pauseSimulation({gameId});
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({game});
      } catch (error) {
        callback({error: error.message});
      }
    });

    socket.on(SocketEvents.FINISHSIMULATION, async (callback) => {
      logger.info('FINISHSIMULATION: %s', gameId);
      try {
        const game = await pauseSimulation({gameId, finishSimulation: true});
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({game});
      } catch (error) {
        callback({error: error.message});
      }
    });

    socket.on(SocketEvents.PERFORMACTION, async ({actionId, params}, callback) => {
      logger.info('PERFORMACTION: %s', JSON.stringify({gameId, actionId, params}));
      try {
        const game = await performAction({
          gameId,
          actionId,
          params,
        });
        io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
        callback({game});
      } catch (error) {
        callback({error: error.message});
      }
    });
    socket.on(SocketEvents.UPDATEGAME, async () => {
      const game = await getGame(
          gameId
      );
      io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
    })
    return io;
  });
};
