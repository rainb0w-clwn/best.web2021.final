import React, { useState, useEffect, useMemo } from 'react';
import { Container } from 'react-bootstrap';

import Header from './Header';
import Footer from './Footer';
import ActionTable from './ActionTable/ActionTable';
import LogsAndThreats from './LogsAndThreats/LogsAndThreats';
import FacilitatorTable from './FacilitatorTable';
import { SimulationTabs } from '../../constants';

const Simulation = () => {
  const [activeTab, setActiveTab] = useState(
    SimulationTabs.ACTION_TABLE,
  );

  useEffect(() => {
    document.querySelector('#root').scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

  const body = useMemo(() => {
    switch (activeTab) {
      case SimulationTabs.LOGS_AND_THREATS:
        return <LogsAndThreats />;
      case SimulationTabs.ACTION_TABLE:
        return <ActionTable />;
      case SimulationTabs.CAMPAIGN_HQ:
        return <FacilitatorTable activeTab="hq" />;
      case SimulationTabs.LOCAL_BRANCH:
        return <FacilitatorTable activeTab="local" />;
      default:
        return 'Unknown page.';
    }
  }, [activeTab]);

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <Container fluid="md" className="mb-5 pb-5">
        {body}
      </Container>
      <Footer />
    </>
  );
};

export default Simulation;
