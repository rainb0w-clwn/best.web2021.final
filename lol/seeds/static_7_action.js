exports.seed = (knex) =>
  knex('action')
    .del()
    .then(() =>
      knex('action').insert([
        {
          id: 'A1',
          description: 'Change ',
          type: 'hq',
          cost: 0,
          budget_increase: 0,
          required_systems: ['S4', 'S5', 'S9', 'S6', 'S10', 'S1', 'S2'],
        },
      ]),
    );
