import React, { useRef, useCallback } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { map as _map } from 'lodash';

import { useStaticData } from '../../StaticDataProvider';
import { gameStore } from '../../GameStore';
import { numberToUsd } from '../../../util';

const Curveballs = ({ className }) => {
  const { curveballs } = useStaticData();
  const {
    actions: { performCurveball },
    popError,
    closeError,
  } = gameStore;

  const formRef = useRef();

  const submitCurveball = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isValid =
        event.target.checkValidity() &&
        event.target?.curveballs?.value;
      if (isValid) {
        closeError();
        performCurveball({
          curveballId: event.target.curveballs.value,
        });
        formRef.current.reset();
      } else {
        popError('Please select an action.');
      }
    },
    [popError, closeError, performCurveball],
  );

  return (
    <Form
      onSubmit={submitCurveball}
      noValidate
      ref={formRef}
      id="curveball"
    >
      <Row className={className}>
        <Col xs={9}>
          <h2 className="font-weight-bold">CURVEBALL EVENTS</h2>
        </Col>
        <Col xs={3}>
          <Button
            variant="outline-primary"
            className="rounded-pill w-100"
            type="submit"
          >
            TRIGGER EVENT
          </Button>
        </Col>
        <Col>
          {_map(curveballs, (curveball) => (
            <Form.Check
              custom
              required
              type="radio"
              className="custom-radio-right"
              key={curveball.id}
              label={
                <Row className="py-1 select-row align-items-center">
                  <Col xs={7}>{curveball.description}</Col>
                  <Col className="text-right">
                    {curveball.budget_change ||
                    curveball.lose_all_budget
                      ? `Budget: ${
                          curveball.budget_change > 0 &&
                          !curveball.lose_all_budget
                            ? '+'
                            : ''
                        }${
                          curveball.lose_all_budget
                            ? 'Party loses all its money'
                            : numberToUsd(curveball.budget_change)
                        }`
                      : ''}
                    {curveball.poll_change &&
                    (curveball.budget_change ||
                      curveball.lose_all_budget)
                      ? ', '
                      : ''}
                    {curveball.poll_change
                      ? `Poll: ${
                          curveball.poll_change > 0 ? '+' : ''
                        }${curveball.poll_change}%`
                      : ''}
                  </Col>
                </Row>
              }
              name="curveballs"
              id={curveball.id}
              value={curveball.id}
            />
          ))}
        </Col>
      </Row>
    </Form>
  );
};

export default Curveballs;
