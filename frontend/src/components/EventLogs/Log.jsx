import React, { useState, useEffect } from 'react';
import { Accordion, Card, Row, Col } from 'react-bootstrap';
import { AiOutlineDown } from 'react-icons/ai';

import { accordionOpeners } from './EventLogs';

const SimpleLog = ({ title }) => (
  <Card
    className="border-primary injection my-4"
    style={{ borderRadius: '1rem', overflow: 'hidden' }}
  >
    <Card.Header className="py-3 bg-white border-bottom-0">
      <Row className="align-items-center">
        <Col xs={12} className="font-weight-bold">
          {title}
        </Col>
      </Row>
    </Card.Header>
  </Card>
);

const ToggleHeader = ({ title, changeIsOpen, isOpen }) => (
  <Card.Header
    className="cursor-pointer border-primary py-3 bg-white"
    onClick={() => changeIsOpen(!isOpen)}
  >
    <Row className="align-items-center">
      <Col xs={10} className="font-weight-bold">
        {title}
      </Col>
      <Col
        xs={2}
        className="d-flex justify-content-end align-items-center"
      >
        <AiOutlineDown
          className="ml-2 text-primary"
          fontSize="25px"
        />
      </Col>
    </Row>
  </Card.Header>
);

const AccordionLog = ({ children, title }) => {
  const [isOpen, changeIsOpen] = useState(false);

  useEffect(() => {
    accordionOpeners.push((newState) => changeIsOpen(newState));
  }, [changeIsOpen]);

  return (
    <Accordion className="my-4" activeKey={isOpen ? '0' : '1'}>
      <Card
        className="border-primary injection"
        style={{ borderRadius: '1rem' }}
      >
        <ToggleHeader
          title={title}
          changeIsOpen={changeIsOpen}
          isOpen={isOpen}
        />
        <Accordion.Collapse eventKey="0">
          {children}
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};

const Log = ({ children, title }) =>
  children ? (
    <AccordionLog title={title}>{children}</AccordionLog>
  ) : (
    <SimpleLog title={title} />
  );

export default Log;
