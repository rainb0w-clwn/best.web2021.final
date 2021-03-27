import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';

import { gameStore } from '../GameStore';

const Mitigations = view(
  ({ isLog = false, className, isInventory = false }) => {
    const {
      actions: { startSimulation },
    } = gameStore;



    return (
      <>
        {!isLog && !isInventory && (
          <div
            className="py-3 border-primary border-top position-fixed w-100 bg-white shadow-lg"
            style={{ bottom: 0 }}
          >
            <Container fluid="md">
              <Row>
                <Col xs={12}>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill"
                    type="button"
                    onClick={startSimulation}
                  >
                    <h4 className="font-weight-normal mb-0">
                      START Simulation
                    </h4>
                  </Button>
                </Col>
                {/*<Col xs={4} className="d-flex justify-content-end">*/}
                {/*  <Nav.Link*/}
                {/*    href={`?gameId=${id}&isProjectorView=true`}*/}
                {/*    className="btn btn-outline-primary rounded-pill d-flex align-items-center projector-button"*/}
                {/*    target="_blank"*/}
                {/*  >*/}
                {/*    <div>*/}
                {/*      <FiBarChart2 fontSize="25px" />*/}
                {/*    </div>*/}
                {/*    <h4 className="font-weight-normal mb-0 ml-1">*/}
                {/*      PROJECTOR*/}
                {/*    </h4>*/}
                {/*  </Nav.Link>*/}
                {/*</Col>*/}
              </Row>
            </Container>
          </div>
        )}
      </>
    );
  },
);

export default Mitigations;
