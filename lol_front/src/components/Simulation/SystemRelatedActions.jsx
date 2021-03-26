import React, { useMemo, useCallback } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { filter as _filter } from 'lodash';
import { view } from '@risingstack/react-easy-state';

import { useStaticData } from '../StaticDataProvider';
import { gameStore } from '../GameStore';
import { numberToUsd } from '../../util';

const SystemRelatedActions = view(({ location, className }) => {
  const {
    budget,
    mitigations: gameMitigations,
    systems: gameSystems,
    popError,
    closeError,
    actions: { restoreSystem },
  } = gameStore;
  const { responses, systems } = useStaticData();

  const systemRealtedActions = useMemo(
    () =>
      _filter(
        responses,
        ({
          systems_to_restore,
          required_mitigation,
          required_mitigation_type,
          location: responseLocation,
        }) =>
          // has system to restore
          systems_to_restore?.length &&
          // location type matches
          (!location || responseLocation === location) &&
          // restorable system is down
          systems_to_restore.some((key) => !gameSystems[key]) &&
          // required mitigation met
          (!required_mitigation_type ||
            !required_mitigation ||
            (required_mitigation_type === 'party'
              ? gameMitigations[`${required_mitigation}_hq`] &&
                gameMitigations[`${required_mitigation}_local`]
              : gameMitigations[
                  `${required_mitigation}_${required_mitigation_type}`
                ])),
      ),
    [responses, gameMitigations, gameSystems, location],
  );

  const submitAction = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isValid =
        event.target.checkValidity() &&
        event.target?.systemRealtedActions?.value;
      if (isValid) {
        closeError();
        restoreSystem({
          responseId: event.target.systemRealtedActions.value,
        });
      } else {
        popError('Please select an action.');
      }
    },
    [popError, closeError, restoreSystem],
  );

  return (
    <Form onSubmit={submitAction} noValidate id="system_actions">
      <Row className={className}>
        <Col xs={9}>
          <h2 className="font-weight-bold">
            ACTIONS RELATED TO TECHNICAL SYSTEMS:
          </h2>
        </Col>
        <Col xs={3}>
          <Button
            variant="outline-primary"
            className="rounded-pill w-100"
            type="submit"
            disabled={!systemRealtedActions.length}
          >
            PERFORM ACTION
          </Button>
        </Col>
        <Col>
          {systemRealtedActions.length
            ? systemRealtedActions.map((action) => (
                <Form.Check
                  custom
                  required
                  type="radio"
                  className="custom-radio-right"
                  key={action.id}
                  label={
                    <Row className="py-1 select-row align-items-center">
                      <Col xs={10}>
                        {`${
                          action.description
                        } (Restores:${action.systems_to_restore.map(
                          (systemId) => ` ${systems[systemId].name}`,
                        )})`}
                      </Col>
                      <Col
                        xs={2}
                        className="justify-content-end d-flex align-items-center"
                      >
                        {numberToUsd(action.cost)}
                      </Col>
                    </Row>
                  }
                  name="systemRealtedActions"
                  disabled={budget < action.cost}
                  id={action.id}
                  value={action.id}
                />
              ))
            : 'No system related action is available.'}
        </Col>
      </Row>
    </Form>
  );
});

export default SystemRelatedActions;
