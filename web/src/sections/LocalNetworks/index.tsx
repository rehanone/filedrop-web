import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import styles from './index.module.scss';
import { networkStore } from '../../stores/index.js';
import { TargetTile } from '../../components/TargetTile.js';

export const LocalNetworks: React.FC = observer(() => {
  const networks = networkStore.otherNetworks;
  if (!networks?.length) {
    return null;
  }

  return (
    <div className={clsx(styles.list)}>
      {networks.map(network => (
        <Link
          to={`/${network.name}`}
          key={network.name}
          className={styles.network}
        >
          <span>{network.name}</span>
          <div className={styles.clients}>
            {network.clients.map(client => (
              <TargetTile
                variant="small"
                key={client.clientId}
                client={client}
              />
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
});