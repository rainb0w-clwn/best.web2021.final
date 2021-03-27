import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { keyBy as _keyBy } from 'lodash';

const StaticDataContext = React.createContext(null);

export const useStaticData = () => {
  const context = useContext(StaticDataContext);
  if (context === undefined) {
    throw new Error('StaticDataProvider not found');
  }
  return context;
};

export const StaticDataProvider = ({ children }) => {
  // ACTIONS
  const [actionsLoading, setActionsLoading] = useState(false);
  const [actions, setActions] = useState([]);
  useEffect(() => {
    setActionsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/actions`)
      .then(({ data }) => {
        setActions(_keyBy(data, 'id'));
      })
      .catch((e) => console.error(e))
      .finally(() => setActionsLoading(false));
  }, [setActions]);

  return (
    <StaticDataContext.Provider
      value={{
        actionsLoading,
        actions,
        loading:
          actionsLoading,
      }}
    >
      {children}
    </StaticDataContext.Provider>
  );
};
