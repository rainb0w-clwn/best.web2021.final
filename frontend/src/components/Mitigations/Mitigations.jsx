import React, { useMemo } from 'react';
import { Container, Row, Col, Button, Nav } from 'react-bootstrap';
import { FiBarChart2 } from 'react-icons/fi';
import { reduce as _reduce, map as _map } from 'lodash';
import { view } from '@risingstack/react-easy-state';

import { gameStore } from '../GameStore';
import { useStaticData } from '../StaticDataProvider';
import MitigationCategory from './MitigationCategory';
import { numberToUsd } from '../../util';

const Mitigations = view(
  ({ isLog = false, className, isInventory = false }) => {
    const {
      id,
      budget,
      mitigations: gameMitigations,
      preparationMitigations,
      actions: { toggleMitigation, startSimulation },
    } = gameStore;
    const { mitigations } = useStaticData();

    const mitigationsByCategory = useMemo(
      () =>
        _reduce(
          mitigations,
          (categories, item) => ({
            ...categories,
            [item.category]: [
              ...(categories[item.category] || []),
              item,
            ],
          }),
          {},
        ),
      [mitigations],
    );

    const toggledMitigations = useMemo(
      () => (isLog ? preparationMitigations : gameMitigations),
      [isLog, preparationMitigations, gameMitigations],
    );

    const allocatedCategoryBudgets = useMemo(
      () =>
        mitigationsByCategory
          ? _reduce(
              mitigationsByCategory,
              (acc, category, categoryKey) => {
                const categorySum = _reduce(
                  category,
                  (sum, { id, hq_cost, local_cost }) => {
                    let newSum = sum;
                    if (toggledMitigations[`${id}_hq`] && hq_cost) {
                      newSum += hq_cost;
                    }
                    if (
                      toggledMitigations[`${id}_local`] &&
                      local_cost
                    ) {
                      newSum += local_cost;
                    }
                    return newSum;
                  },
                  0,
                );
                return {
                  ...acc,
                  [categoryKey]: categorySum,
                  sum: (acc.sum || 0) + categorySum,
                };
              },
              {},
            )
          : { sum: 0 },
      [toggledMitigations, mitigationsByCategory],
    );

    return (
      <>
        {!isLog && !isInventory && (
          <div
            className="py-3 border-primary border-bottom position-sticky bg-white shadow"
            style={{ top: 0, zIndex: 1 }}
          >
            <Container fluid="md">
              <Row>
                <Col>
                  <h3 className="m-0">
                    <span className="mr-1">Budget Allocated:</span>
                    {numberToUsd(allocatedCategoryBudgets.sum)}
                  </h3>
                </Col>
                <Col className="text-right">
                  <h3 className="m-0">
                    <span className="mr-1">Remaining Budget:</span>
                    {numberToUsd(budget)}
                  </h3>
                </Col>
              </Row>
            </Container>
          </div>
        )}
        <Container fluid="md" className={className} id="mitigations">
          {isInventory && (
            <Row>
              <Col xs={12}>
                <h2 className="font-weight-bold mb-1">
                  PURCHASED ITEMS:
                </h2>
              </Col>
            </Row>
          )}
          {_map(mitigationsByCategory, (category, key) => (
            <MitigationCategory
              key={key}
              name={key}
              mitigations={category}
              toggledMitigations={toggledMitigations}
              allocatedBudget={allocatedCategoryBudgets[key]}
              toggleMitigation={toggleMitigation}
              budget={budget}
              isSummary={isLog || isInventory}
            />
          ))}
        </Container>
        {!isLog && !isInventory && (
          <div
            className="py-3 border-primary border-top position-fixed w-100 bg-white shadow-lg"
            style={{ bottom: 0 }}
          >
            <Container fluid="md">
              <Row>
                <Col xs={8}>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill"
                    type="button"
                    disabled={!mitigationsByCategory}
                    onClick={startSimulation}
                  >
                    <h4 className="font-weight-normal mb-0">
                      SAVE Items and START Simulation
                    </h4>
                  </Button>
                </Col>
                <Col xs={4} className="d-flex justify-content-end">
                  <Nav.Link
                    href={`?gameId=${id}&isProjectorView=true`}
                    className="btn btn-outline-primary rounded-pill d-flex align-items-center projector-button"
                    target="_blank"
                  >
                    <div>
                      <FiBarChart2 fontSize="25px" />
                    </div>
                    <h4 className="font-weight-normal mb-0 ml-1">
                      PROJECTOR
                    </h4>
                  </Nav.Link>
                </Col>
              </Row>
            </Container>
          </div>
        )}
      </>
    );
  },
);

export default Mitigations;
