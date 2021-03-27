const dotenv = require('dotenv');
const {resolve} = require('path');
const envFound = dotenv.config({path: resolve(__dirname, "../.env")});
if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

const config = {
  port: process.env.PORT,
  environment: process.env.NODE_ENV,

  balanceAzs: parseInt(process.env.BALANCE_AZS, 10), //остаток топлива на АЗС
  balanceRepository: parseInt(process.env.BALANCE_AZS, 10), //остаток топлива в хранилище
  startNumberAzs: parseInt(process.env.START_NUMBER_AZS, 10), // количество существующих АЗС
  startNumberTanker: parseInt(process.env.START_NUMBER_TANKER, 10), // кол-во такеров
  costTanker: parseInt(process.env.COST_TANKER, 10), //стоимость танкера
  timeTanker: parseInt(process.env.TIME_TANKER, 10), //время пути танкера
  timeServiceCar: parseInt(process.env.TIME_SERVICE_CAR, 10), //время на обслуж-е 1 машины
  profitCar: parseInt(process.env.PROFIT_CAR, 10), //прибыль с 1 машины
  costAzs: parseInt(process.env.COST_AZS, 10), //стоимость АЗС
  costWorkPlace: parseInt(process.env.COST_WORK_PLACE, 10), //стоимость обслуж-го места
  timeBuildingAzs: parseInt(process.env.TIME_BUILDING_AZS, 10), //время постройки АЗС
  timeBuildingWorkPlace: parseInt(process.env.TIME_BUILDING_WORK_PLACE, 10), //время постройки осблуж-го места
  costCashierPerMonth: parseInt(process.env.COST_CASHIER_PER_MONTH, 10), // зп кассира в месяц
  costRefuellerPerMonth: parseInt(process.env.COST_REFUELLER_PER_MONTH, 10),  //зп заправщика в месяц
  costDirectorPerMonth: parseInt(process.env.COST_DIRECTOR_PER_MONTH, 10), //зп директора в месяц
  costGuardPerMonth: parseInt(process.env.COST_GUARD_PER_MONTH, 10), //за охранника в месяц
  numberWorkPlaceForDopCashier: parseInt(process.env.NUMBER_WORK_PLACE_FOR_DOP_CASHIER_, 10), //кол-во обслуж-х мест для найма доп кассира
  chanceToRetire: parseInt(process.env.CHANCE_TO_RETIRE, 10), //шанс уволиться при найме по ГПХ в процентах
  monthInSeconds: parseInt(process.env.TIME_GAME_IN_SECONDS, 10),  //время в секундах
};
module.exports = config;
