import React from 'react';
import { Row, Col } from 'react-bootstrap';
import classNames from 'classnames';
import { view } from '@risingstack/react-easy-state';

import { SimulationTabs } from '../../constants';
import { gameStore } from '../GameStore';

const Header = view(({ activeTab, setActiveTab }) => {
  const { id } = gameStore;
  return (
    <div className="position-sticky bg-white text-center simulation-menu shadow">
      <Row className="m-0">
        <Col xs={12} className="p-0 d-flex justify-content-center">
          <h4 className="my-1 font-weight-bold">{id}</h4>
        </Col>
      </Row>
      <Row className="m-0 border-primary border-bottom border-top shadow-sm">
        <Col
          xs={4}
          className={classNames(
            'simulation-menu-item cursor-pointer border-primary border-right p-0',
            {
              active: activeTab === SimulationTabs.ACTION_TABLE,
            },
          )}
          onClick={() => setActiveTab(SimulationTabs.ACTION_TABLE)}
        >
          <h5 className="my-2">ACTION TABLE</h5>
        </Col>
        <Col
          xs={4}
          className={classNames(
            'simulation-menu-item cursor-pointer border-primary border-right p-0',
            {
              active: activeTab === SimulationTabs.AZS_LIST,
            },
          )}
          onClick={() => setActiveTab(SimulationTabs.AZS_LIST)}
        >
          <h5 className="my-2">GAS STATIONS</h5>
        </Col>
        <Col
          xs={4}
          className={classNames(
            'simulation-menu-item cursor-pointer p-0',
            {
              active: activeTab === SimulationTabs.LOGS_AND_THREATS,
            },
          )}
          onClick={() =>
            setActiveTab(SimulationTabs.LOGS_AND_THREATS)
          }
        >
          <h5 className="my-2">EVENT LOGS</h5>
        </Col>
      </Row>
      <Row className="m-0 border-primary border-bottom">
        {activeTab === SimulationTabs.ACTION_TABLE && (
          <>
            <Col
              md={12}
              className="d-flex justify-content-center align-items-center simulation-menu-item--small cursor-pointer border-primary border-right p-0"
              onClick={() =>
                document
                  .querySelector('#hq_actions')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              <p className="my-0">USER ACTIONS</p>
            </Col>
          </>
        )}
        {activeTab === SimulationTabs.LOGS_AND_THREATS && (
          <>
            <Col
              xs={12}
              className="d-flex justify-content-center align-items-center simulation-menu-item--small cursor-pointer p-0"
              onClick={() =>
                document.querySelector('#logs')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              <p className="my-0">EVENT LOG</p>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
});

export default Header;
