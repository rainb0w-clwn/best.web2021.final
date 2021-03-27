import React, { useCallback, useMemo, useRef } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import { view } from '@risingstack/react-easy-state';
import { gameStore } from '../GameStore';
import { reduce as _reduce } from 'lodash';
import { numberToUsd } from '../../util';

const AvailableActionItems = view(({ actionList, role }) => {
  const {
    actions: { performAction },
    monthDistribution,
      currentMonth,
    popError,
    closeError,
  } = gameStore;
  let newMonthDistribution = {...monthDistribution};
  newMonthDistribution = Object.keys(monthDistribution).map(item => monthDistribution[item]);
  newMonthDistribution = newMonthDistribution.slice(currentMonth+1)
  newMonthDistribution = newMonthDistribution.join(',');

  const formRef = useRef();

  const submitAction = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isValid =
        event.target.checkValidity() && event.target?.actions?.value;
      if (isValid) {
        console.log(event.target.monthDistribution.value);
        closeError();
        performAction({
          actionId: event.target.actions.value,
            params: {monthDistribution:  event.target.monthDistribution.value}
        });
        formRef.current.reset();
      } else {
        popError('Please select an action.');
      }
    },
    [popError, closeError, performAction],
  );
  return (
    <Container className="p-0 m-0 pl-3">
      <Form
        onSubmit={submitAction}
        noValidate
        className="mb-4"
        ref={formRef}
      >
        <Row className="d-flex align-items-center mb-1">
          <Col xs={8} lg={9}>
            <h6 className="m-0 font-weight-bold">
              AVAILABLE ACTIONS:
            </h6>
          </Col>
          <Col xs={4} lg={3}>
            <Button
              variant="outline-primary"
              className="rounded-pill w-100"
              type="submit"
              disabled={actionList.length === 0}
            >
              PERFORM ACTION
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            {actionList
              ? Object.keys(actionList).map(action => (
                  <>
                  <Form.Check
                    custom
                    required
                    type="radio"
                    className="custom-radio-right"
                    key={`${role}_${actionList[action].id}`}
                    label={
                      <Row className="py-1 select-row align-items-center">
                        <Col xs={9}>{actionList[action].description}</Col>
                        <Col className="flex-grow-1 text-right">
                          {actionList[action].description}
                        </Col>
                      </Row>
                    }
                    name="actions"
                    id={`${role}_${actionList[action].id}`}
                    value={actionList[action].id}
                  />
                  <Row className="py-1 select-row align-items-center">
                    <Col xs={6} className="flex-grow-1 text-right">
                      <Form.Control  className="control-input" type="text" required name="monthDistribution" defaultValue={newMonthDistribution} />
                    </Col>
                  </Row>
                  </>
                ))
              : 'No action item is available to purchase.'}
          </Col>
        </Row>
      </Form>
    </Container>
  );
});

export default AvailableActionItems;
