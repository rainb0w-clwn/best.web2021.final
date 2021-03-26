exports.seed = (knex) =>
  knex('system')
    .del()
    .then(() =>
      knex('system').insert([
        {
          id: 'S1',
          name: 'Party website',
          description: '',
          type: 'party',
        },
        {
          id: 'S2',
          name: 'HQ Facebook',
          description: '',
          type: 'hq',
        },
        {
          id: 'S3',
          name: 'HQ Twitter',
          description: '',
          type: 'hq',
        },
        {
          id: 'S4',
          name: 'HQ Member Database',
          description: '',
          type: 'hq',
        },
        {
          id: 'S5',
          name: 'HQ Computers',
          description: '',
          type: 'hq',
        },
        {
          id: 'S6',
          name: 'HQ Phones',
          description: '',
          type: 'hq',
        },
        {
          id: 'S7',
          name: 'LB Facebook',
          description: '',
          type: 'local',
        },
        {
          id: 'S8',
          name: 'LB Member Files',
          description: '',
          type: 'local',
        },
        {
          id: 'S9',
          name: 'LB Computers',
          description: '',
          type: 'local',
        },
        {
          id: 'S10',
          name: 'LB Phones',
          description: '',
          type: 'local',
        },
        {
          id: 'S11',
          name: 'HQ Campaign Ability',
          description: '',
          type: 'hq',
        },
        {
          id: 'S12',
          name: 'LB Campaign Ability',
          description: '',
          type: 'local',
        },
      ]),
    );
