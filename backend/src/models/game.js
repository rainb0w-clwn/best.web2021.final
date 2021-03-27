const db = require('./db');
const logger = require('../logger');
const GameStates = require('../constants/GameStates');
const {getTimeTaken} = require('../util');
const config = require('../config');
const {startGame} = require('./startGame');

const getGame = async (id) => {
    let lol = await db('game')
        .select(
            'game.id',
            'game.state',
            'game.budget',
            'game.started_at',
            'game.paused',
            'game.millis_taken_before_started',
            'game.monthDistribution',
            'game.currentMonth',
            'azs',
            'tanker',
            'staff',
            'place',
            'l.logs',
        )
        .where({'game.id': id})
        .joinRaw(
            ` LEFT JOIN (SELECT ga.game_id, staff, place, array_agg(to_json(ga)) AS azs FROM azs ga
                                                                                                LEFT JOIN (SELECT gs.azs_id, to_jsonb(array_agg(gs)) AS staff FROM staff gs GROUP BY gs.azs_id) s ON s.azs_id = ga.id
                                                                                                LEFT JOIN (SELECT wp.azs_id, to_jsonb(array_agg(wp)) AS place FROM work_place wp GROUP BY wp.azs_id) p ON p.azs_id = ga.id
                    GROUP BY ga.game_id, s.staff, p.place) a ON a.game_id = game.id`
        )
        .joinRaw(
            `LEFT JOIN (SELECT gt.game_id, array_agg(to_json(gt)) AS tanker FROM tanker gt GROUP BY gt.game_id) t ON t.game_id = game.id`,
        )
        .joinRaw(
            `LEFT JOIN (SELECT gl.game_id, array_agg(to_json(gl)) AS logs FROM game_log gl GROUP BY gl.game_id) l ON l.game_id = game.id`,
        )
        .first();
    console.log(lol);
    return lol;
}

const createGame = async (id, monthDistribution) => {
    let store_balance = config.balanceRepository;
    await db('game').insert(
        {
            id,
            monthDistribution,
            store_balance: store_balance,
        },
        ['id'],
    );
    let azs = [];
    for (let i = 0, l = config.startNumberAzs; i < l; i++) {
        azs.push({})
    }

    let azs_balance = config.balanceAzs;

    let azsId = [];
     await db('azs').insert(
        azs.map(() => ({
            game_id: id,
            state: 'ready',
            balance: azs_balance,
        })));
    let azsArr = await db('azs').select().where({game_id: id});
    let arrStaff = [];
    azsArr.map((azs) => {
        arrStaff.push({
                azs_id: azs.id,
                contract_type: 'TK',
                state: 'work',
                staff_type: 'cashier'
            },
            {
                azs_id: azs.id,
                contract_type: 'TK',
                state: 'work',
                staff_type: 'guard'
            },
            {
                azs_id: azs.id,
                contract_type: 'TK',
                state: 'work',
                staff_type: 'director'
            },
        )
    });
    await db('staff').insert(arrStaff);

    let tanker = [];
    for (let i = 0, l = config.startNumberTanker; i < l; i++) {
        tanker.push({})
    }
    tankerId = await db('tanker').insert(
        azs.map(() => ({
            game_id: id,
            state: 'ready',
        })),
        ['id']
    );
    return getGame(id);
};


const startSimulation = async (gameId) => {
    try {
        const {state, millisTakenBeforeStarted} = await db('game')
            .select(
                'state',
                'millis_taken_before_started as millisTakenBeforeStarted',
            )
            .where({id: gameId})
            .first();
        if (state === GameStates.ASSESSMENT) {
            throw new Error('Cannot start finalized game');
        }
        await db('game')
            .where({id: gameId})
            .update({
                started_at: db.fn.now(),
                paused: false,
                ...(state === GameStates.PREPARATION
                    ? {state: GameStates.SIMULATION, budget: 0}
                    : {}),
            });
        if (state === GameStates.PREPARATION) {
            startGame(gameId);
        }
        await db('game_log').insert({
            game_id: gameId,
            game_timer: millisTakenBeforeStarted,
            type: 'Game State Changed',
            description:
                state === GameStates.PREPARATION
                    ? 'Simulation Started'
                    : 'Timer Started',
        });
    } catch (error) {
        if (error.message === 'Cannot start finalized game') {
            throw error;
        }
        logger.error('startSimulation ERROR: %s', error);
        throw new Error('Server error on start simulation');
    }
    return getGame(gameId);
};

const pauseSimulation = async ({gameId, finishSimulation = false}) => {
    try {
        const {millisTakenBeforeStarted, startedAt, paused} = await db('game')
            .select(
                'millis_taken_before_started as millisTakenBeforeStarted',
                'started_at as startedAt',
                'paused',
            )
            .where({id: gameId, state: GameStates.SIMULATION})
            .first();
        const newMillisTakenBeforeStarted =
            millisTakenBeforeStarted + (Date.now() - new Date(startedAt).getTime());
        await db('game')
            .where({id: gameId, state: GameStates.SIMULATION})
            .update({
                paused: true,
                ...(!paused
                    ? {millis_taken_before_started: newMillisTakenBeforeStarted}
                    : {}),
                ...(finishSimulation ? {state: GameStates.ASSESSMENT} : {}),
            });
        await db('game_log').insert({
            game_id: gameId,
            ...(!paused
                ? {game_timer: newMillisTakenBeforeStarted}
                : {game_timer: millisTakenBeforeStarted}),
            type: 'Game State Changed',
            description: finishSimulation ? 'Game Finalized' : 'Timer Stopped',
        });
    } catch (error) {
        if (finishSimulation) {
            logger.error('finishSimulation ERROR: %s', error);
        } else {
            logger.error('pauseSimulation ERROR: %s', error);
        }
        throw new Error('Server error on pause simulation');
    }
    return getGame(gameId);
};

const performAction = async ({gameId, actionId, params}) => {
    try {
        const game = await db('game')
            .select(
                'budget',
                'monthDistribution',
                'currentMonth',
                'started_at as startedAt',
                'paused',
                'millis_taken_before_started as millisTakenBeforeStarted',
            )
            .where({id: gameId})
            .first();

        const {payload} = await db(
            'action',
        )
            .select(
                'payload',
            )
            .where({id: actionId})
            .first();
        if (payload.type === "changeMonthDistribution") {
            let oldMonthDistribution = game.monthDistribution;
            let {monthDistribution} = params;
            monthDistribution = monthDistribution.split(',')
            for (let i = 0; i < monthDistribution.length; i++) {
                monthDistribution[i] = parseInt(monthDistribution[i], 10);
            }
            oldMonthDistribution = oldMonthDistribution.slice(0, game.currentMonth+1);
            oldMonthDistribution = oldMonthDistribution.concat(monthDistribution);
            console.log(oldMonthDistribution)
            await db('game')
                .where({id: gameId})
                .update({
                    monthDistribution: oldMonthDistribution,
                });

            await db('game_log').insert({
                game_id: gameId,
                game_timer: getTimeTaken(game),
                type: 'Campaign Action',
                action_id: actionId,
            });
        }

    } catch (error) {
        logger.error('performAction ERROR: %s', error);
        switch (error.message) {
            case 'Not enough budget':
                throw error;
            case 'The required systems for this action are not available':
                throw error;
            default:
                throw new Error('Server error on performing action');
        }
    }
    return getGame(gameId);
};

module.exports = {
    createGame,
    getGame,
    performAction,
    startSimulation,
    pauseSimulation,
};
