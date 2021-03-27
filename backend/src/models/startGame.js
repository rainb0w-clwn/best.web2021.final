const db = require('./db');
const logger = require('../logger');
const {getTimeTaken} = require('../util');
const config = require('../config');

const startGame = (gameId) => {
    let letMonthInterval = setInterval(async function () {
        await initMonth(gameId)
    }, config.monthInSeconds * 1000);
}

module.exports = {
    startGame
};

let makeDeliveryToStore = async (gameId) => {
    const getGame = await db('game')
        .select(
            'game.monthDistribution',
            'game.currentMonth',
            'game.store_balance',
        )
        .where({'game.id': gameId}).first();
    if (getGame.monthDistribution.length < (getGame.currentMonth + 1)) {
        return;
    }
    let currentDelivery = getGame.monthDistribution[getGame.currentMonth];
    await db('game')
        .where({id: gameId})
        .update({
            store_balance: getGame.store_balance + currentDelivery,
        });
}
let setNewMonth = async (gameId) => {
    await db('game')
        .where({id: gameId})
        .increment('currentMonth', 1);
    let game = await db('game').select().where({id: gameId}).first();
    if (game.currentMonth > game.monthDistribution.length ){
        throw new Error('game must to be stopped!!!!')
    }
}

let reduceBalanceForService = async (gameId) => {
    let game = await db('game')
        .select(
            'game.id',
            'game.budget',
            'a.azs',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .first();
    let totalReduce = 0;
    for (const azs of game.azs) {
        if (azs.state == 'ready') {
            totalReduce += config.costAzs;
        }
    }
    if (totalReduce > 0) {
        await db('game')
            .where({id: gameId})
            .decrement('budget', totalReduce);
    }

}


let updateWorkerStatus = async (gameId) => {
    let game = await db('game')
        .select(
            'game.id',
            'game.budget',
            'a.azs',
            's.staff',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .joinRaw(
            `LEFT JOIN (SELECT gs.azs_id, array_agg(to_json(gs)) AS staff FROM staff gs GROUP BY gs.azs_id) s ON s.azs_id = a.id`,
        )
        .first();
    for (const staff of game.staff) {
        if (staff.state == 'new') {
            await db('staff')
                .where({id: staff.id})
                .update({
                    state: 'work'
                });
        }
        if (staff.state == 'to_retire') {
            if (staff.contract_type == 'TK') {
                await db('staff')
                    .where({id: staff.id})
                    .update({
                        state: 'retiring'
                    });
            }
            if (staff.contract_type == 'GPH') {
                await db('staff')
                    .where({id: staff.id})
                    .update({
                        state: 'retired'
                    });
            }
        }
        if (staff.state == 'retiring') {
            await db('staff')
                .where({id: staff.id})
                .update({
                    state: 'retired'
                });
        }
    }
    //TODO в этой функции добавить случайность на увольнение
}

let reduceBalanceForSalary = async (gameId) => {
    let game = await db('game')
        .select(
            'game.id',
            'game.budget',
            'a.azs',
            's.staff',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .joinRaw(
            `LEFT JOIN (SELECT gs.azs_id, array_agg(to_json(gs)) AS staff FROM staff gs GROUP BY gs.azs_id) s ON s.azs_id = a.id`,
        )
        .first();
    let totalReduce = 0;
    for (const staff of game.staff) {
        if (staff.state !== 'retired' && staff.state !== 'new') {
            if (staff.staff_type == 'director') {
                totalReduce += config.costDirectorPerMonth;
            }
            if (staff.staff_type == 'guard') {
                totalReduce += config.costGuardPerMonth;
            }
            if (staff.staff_type == 'refueller') {
                totalReduce += config.costRefuellerPerMonth;
            }
            if (staff.staff_type == 'cashier') {
                totalReduce += config.costCashierPerMonth;
            }
        }
    }
    if (totalReduce > 0) {
        await db('game')
            .where({id: gameId})
            .decrement('budget', totalReduce);
    }

}

let timeForOilIteration = 100;
let profitForOilIteration = 100;
let timeForOneMonth = 1000;

let timeForTankerDelivery = 2000;

async function initMonth(gameId) {
    await makeDeliveryToStore(gameId);
    await reduceBalanceForService(gameId);
    await reduceBalanceForSalary(gameId);
    await updateWorkerStatus(gameId);
    // //Month routine
    await buyTankersToStabilizate(gameId);
    await checkCurrentSystemState(gameId) //проверка состояния на реализацию всего топлива
    await makeTankerDelivery(gameId);
    await fixProfit(gameId);
    await setNewMonth(gameId);

}

async function fixProfit(gameId) {
    let game = await db('game')
        .select(
            'game.id',
            'game.budget',
            'game.started_at as startedAt',
            'game.paused',
            'game.currentMonth',
            'game.millis_taken_before_started as millisTakenBeforeStarted',
            'a.azs',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .first();
    let totalProfit = 0;
    for (let azs of game.azs) {
        totalProfit += azs.balance * config.profitCar;
        await db('azs').decrement('balance', azs.balance).where({id: azs.id});
    }
    if (totalProfit > 0) {
        await db('game').increment('budget', totalProfit).where({id: gameId});
        await db('game_log').insert({
            game_id: game.id,
            game_timer: getTimeTaken(game),
            type: 'Game State Changed',
            description: `Fix profit for current month = ` + game.currentMonth,
        });
    }
    console.log("CurrentMonth: ", game.currentMonth);
}

async function buyTankersToStabilizate(gameId) {
    let game = await db('game')
        .select(
            'game.id',
            'game.budget',
            'game.started_at as startedAt',
            'game.paused',
            'game.millis_taken_before_started as millisTakenBeforeStarted',
            'a.azs',
            't.tanker',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .joinRaw(
            `LEFT JOIN (SELECT gt.game_id, array_agg(to_json(gt)) AS tanker FROM tanker gt GROUP BY gt.game_id) t ON t.game_id = game.id`,
        )
        .first();
    let tankerCount = game.tanker ? game.tanker.length : 0
    let azsCount = game.azs ? game.azs.length : 0
    if (azsCount > tankerCount) {
        let buyTanker = [];
        for (let i = 0, l = azsCount - tankerCount; i < l; i++) {
            buyTanker.push({
                game_id: gameId,
                state: 'ready',
            })
        }
        let boughtCount = azsCount - tankerCount;
        await db('tanker').insert(buyTanker);
        await db('game_log').insert({
            game_id: game.id,
            game_timer: getTimeTaken(game),
            type: 'Game State Changed',
            description: `Bought ${boughtCount} new tankers dueto optimization`,
        });
        await db('game').decrement('bought', boughtCount * config.costTanker).where({id: gameId});
    }
}

async function checkCurrentSystemState(gameId) {
    let game = await db('game')
        .select(
            'game.id',
            'game.monthDistribution',
            'game.budget',
            'game.started_at as startedAt',
            'game.paused',
            'game.millis_taken_before_started as millisTakenBeforeStarted',
            'azs',
            'place',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.game_id, place, array_agg(to_json(ga)) AS azs FROM azs ga
                                                                                                LEFT JOIN (SELECT wp.azs_id, to_jsonb(array_agg(wp)) AS place FROM work_place wp GROUP BY wp.azs_id) p ON p.azs_id = ga.id
                    GROUP BY ga.game_id, p.place) a ON a.game_id = game.id`,
        )
        .first();

    let OilMonthDistribution = game.monthDistribution;
    let totalDistribution = OilMonthDistribution.reduce((accumulator, currentValue) => accumulator + currentValue)
    let possibleDistribution = countPossibleRealization(game);
    allAzs = game.azs;
    while (checkDistribution(totalDistribution, possibleDistribution)) {
        for (const azs of allAzs) {
            game = await makePlace(azs.id, game);
            possibleDistribution = countPossibleRealization(game);
            if (!checkDistribution(totalDistribution, possibleDistribution)) {
                break;
            }
        }
    }
}

function countPossibleRealization(game) {
    let placesCount = game.place ? game.place.length : 0;
    return placesCount * Math.floor(config.monthInSeconds / config.timeServiceCar) * game.monthDistribution.length;
}

function checkDistribution(totalDistribution, possibleDistribution) {
    return totalDistribution > possibleDistribution;
}

async function makePlace(azs_id, game) {
    let work_place = await db('work_place')
        .insert({
            azs_id: azs_id,
            state: 'building'
        }).returning('id')
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Building new place dueto to lack azs_id=' + azs_id,
    });

    let newStaff = [
        {
            azs_id: azs_id,
            contract_type: 'TK',
            state: 'new',
            staff_type: 'refueller'
        }
    ];
    let currentAllStaff = await db('staff').select().where({'azs_id': azs_id});
    let countCashier = 0;
    let countRefueller = 0;
    for (let curStaff of currentAllStaff) {
        if (curStaff.staff_type == 'cashier') {
            countCashier++;
        } else if (curStaff.staff_type == 'refueller') {
            countRefueller++;
        }
    }
    if (countRefueller + 1 > config.numberWorkPlaceForDopCashier * countCashier) {
        newStaff.push({
            azs_id: azs_id,
            contract_type: 'TK',
            state: 'new',
            staff_type: 'cashier'
        })
        await db('game_log').insert({
            game_id: game.id,
            game_timer: getTimeTaken(game),
            type: 'Game State Changed',
            description: 'Hire new cashier dueto limit of refuellers for azs_id =' + azs_id,
        });
    }
    await db('staff').insert(newStaff);
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Hire new refueller for azs_id = ' + azs_id,
    });
    let completeTimer = setTimeout(() => updatePlaceStatus(work_place[0], game), config.timeBuildingWorkPlace * 1000)
    return db('game')
        .select(
            'game.id',
            'game.monthDistribution',
            'game.budget',
            'game.started_at as startedAt',
            'game.paused',
            'game.millis_taken_before_started as millisTakenBeforeStarted',
            'a.azs',
            'p.place',
        )
        .where({'game.id': game.id})
        .joinRaw(
            `LEFT JOIN (SELECT ga.id, ga.game_id, array_agg(to_json(ga)) AS azs FROM azs ga GROUP BY ga.game_id, ga.id) a ON a.game_id = game.id`,
        )
        .joinRaw(
            `LEFT JOIN (SELECT wp.azs_id, array_agg(to_json(wp)) AS place FROM work_place wp GROUP BY wp.azs_id) p ON p.azs_id = a.id`,
        )
        .first();
}

async function updatePlaceStatus(place_id, game) {
    await db('work_place').update({state: 'ready'}).where({id: place_id});
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Work place building complete place_id=' + place_id,
    });
}

async function makeTankerDelivery(gameId) {
    let game = await db('game')
        .select(
            'game.id',
            'game.monthDistribution',
            'game.budget',
            'game.store_balance',
            'game.started_at as startedAt',
            'game.paused',
            'game.millis_taken_before_started as millisTakenBeforeStarted',
            'azs',
            'place',
        )
        .where({'game.id': gameId})
        .joinRaw(
            `LEFT JOIN (SELECT ga.game_id, place, array_agg(to_json(ga)) AS azs FROM azs ga
                                                                                                LEFT JOIN (SELECT wp.azs_id, to_jsonb(array_agg(wp)) AS place, count(wp.id) as placeCount FROM work_place wp GROUP BY wp.id, wp.azs_id) p ON p.azs_id = ga.id
                    GROUP BY ga.game_id, p.place) a ON a.game_id = game.id`,
        )
        .first();
    let currentOilStore = game.store_balance;
    if (currentOilStore > 0) {
        let tanker = await db('tanker').select().where({game_id: gameId, state: 'ready'});
        let counter = 0;
        for (const azs of game.azs) {
            let placeCount = 0;
            for (let place of game.place) {
                if (place.azs_id == azs.id) {
                    placeCount+=1;
                }
            }
            let possibleProfit = placeCount * Math.floor(config.monthInSeconds / config.timeServiceCar) * config.timeTanker;
            if (currentOilStore < possibleProfit) {
                possibleProfit = currentOilStore;
            }
            await performTankerDelivery(tanker[counter], azs.id, possibleProfit, game);
            currentOilStore -= possibleProfit;
            if (currentOilStore <= 0) {
                break;
            }
            counter++;
        }
    }

}

async function returnTanker(tanker, azs_id, profit, game) {
    await db('azs').increment('balance', profit).where({id: azs_id})
    await db('tanker').update({state: 'to_store', current_azs: 0, current_load: 0}).where({id: tanker.id})
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Tanker delivered fuel and now goes back to store tanker_id=' + tanker.id,
    });
    let completeTimer = setTimeout(() => tankerReturned(tanker, game), config.timeTanker / 2 * 1000)
}

async function tankerReturned(tanker, game) {
    await db('tanker').update({state: 'ready'}).where({id: tanker.id})
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Tanker returned to store tanker_id=' + tanker.id,
    });
}

async function performTankerDelivery(tanker, azs_id, profit, game) {
    await db('tanker').update({state: 'to_azs', current_azs: azs_id, current_load: profit}).where({id: tanker.id})
    await db('game_log').insert({
        game_id: game.id,
        game_timer: getTimeTaken(game),
        type: 'Game State Changed',
        description: 'Tanker send to azs_id = ' + azs_id + ' tanker_id=' + tanker.id,
    });
    let completeTimer = setTimeout(() => returnTanker(tanker, azs_id, profit, game), config.timeTanker / 2 * 1000)
}
