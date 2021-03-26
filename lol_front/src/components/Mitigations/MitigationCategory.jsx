import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import classNames from 'classnames';

import { numberToUsd } from '../../util';

const MitigationCategory = ({
  name,
  mitigations,
  toggledMitigations,
  toggleMitigation,
  allocatedBudget,
  budget,
  isSummary,
}) => (
  <div className={classNames('py-3', isSummary ? 'my-3' : 'my-5')}>
    <Row className="pb-2">
      <Col xs={9}>
        <h4 className="m-0 font-weight-normal border-bottom border-primary w-100 text-uppercase">
          ALLOCATED <span className="font-weight-bold">{name}</span>{' '}
          BUDGET : {numberToUsd(allocatedBudget)}
        </h4>
      </Col>
      <Col xs={3}>
        <Row>
          <Col xs={6} className="text-right">
            HQ
          </Col>
          <Col xs={6} className="text-right">
            Branch
          </Col>
        </Row>
      </Col>
    </Row>
    {mitigations.map((mitigation) => (
      <Row className="py-2 select-row" key={mitigation.id}>
        <Col xs={9}>{mitigation.description}</Col>
        <Col xs={3}>
          <Row>
            <Col xs={6} className="justify-content-end d-flex">
              {mitigation.is_hq &&
                (!isSummary ? (
                  <Form.Check
                    type="switch"
                    className="custom-switch-right"
                    id={`${mitigation.id}_hq`}
                    label={
                      <span>{numberToUsd(mitigation.hq_cost)}</span>
                    }
                    disabled={
                      !toggledMitigations[`${mitigation.id}_hq`] &&
                      budget < mitigation.hq_cost
                    }
                    checked={
                      toggledMitigations[`${mitigation.id}_hq`]
                    }
                    onChange={(e) =>
                      toggleMitigation({
                        id: mitigation.id,
                        type: 'hq',
                        value: e.target.checked,
                      })
                    }
                  />
                ) : (
                  <div className="d-flex align-items-center">
                    {numberToUsd(mitigation.hq_cost)}
                    {toggledMitigations[`${mitigation.id}_hq`] ? (
                      <AiOutlineCheck
                        className="ml-2"
                        fontSize="20px"
                      />
                    ) : (
                      <AiOutlineClose
                        className="ml-2"
                        fontSize="20px"
                      />
                    )}
                  </div>
                ))}
            </Col>
            <Col xs={6} className="justify-content-end d-flex">
              {mitigation.is_local &&
                (!isSummary ? (
                  <Form.Check
                    type="switch"
                    className="custom-switch-right"
                    id={`${mitigation.id}_local`}
                    label={
                      <span>
                        {numberToUsd(mitigation.local_cost)}
                      </span>
                    }
                    disabled={
                      !toggledMitigations[`${mitigation.id}_local`] &&
                      budget < mitigation.local_cost
                    }
                    checked={
                      toggledMitigations[`${mitigation.id}_local`]
                    }
                    onChange={(e) =>
                      toggleMitigation({
                        id: mitigation.id,
                        type: 'local',
                        value: e.target.checked,
                      })
                    }
                  />
                ) : (
                  <div className="d-flex align-items-center">
                    {numberToUsd(mitigation.hq_cost)}
                    {toggledMitigations[`${mitigation.id}_local`] ? (
                      <AiOutlineCheck
                        className="ml-2"
                        fontSize="20px"
                      />
                    ) : (
                      <AiOutlineClose
                        className="ml-2"
                        fontSize="20px"
                      />
                    )}
                  </div>
                ))}
            </Col>
          </Row>
        </Col>
      </Row>
    ))}
  </div>
);

export default MitigationCategory;
