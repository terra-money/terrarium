import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useBlocks } from '../hooks/terra';
import { BlockView } from '../components';
import { useWindowDimensions } from '../utils';

export default function BlocksPage() {
  const [filter, setFilter] = React.useState(false);
  const { get: getBlocks, set: setBlocks } = useBlocks();
  const data = getBlocks();
  const { width } = useWindowDimensions();

  const handleToggleFilter = () => setFilter(!filter);

  const getFilteredBlocks = () => data.blocks.filter(({ block } : {block: any}) => block.data.txs!.length > 0);

  const toggleEventDetails = (index: number) => {
    data.blocks[index].hasEventsOpenInUi = !data.blocks[index].hasEventsOpenInUi;
    setBlocks(data);
  };

  return (
    <div className="flex flex-col w-full">
      <FormControlLabel
        control={(
          <Checkbox
            checked={filter}
            onChange={handleToggleFilter}
            classes={{ root: 'p-0' }}
          />
        )}
        label="Filter Empty Blocks"
        className="flex flex-row w-full text-left items-center px-8 py-5 gap-2 text-blue-600 m-0"
        classes={{ label: 'text-sm text-terra-text font-gotham' }}
      />
      <div
        className="bg-white grid items-center w-full px-4 py-5 md:pl-8 pr-3 text-blue-600 font-bold z-50 shadow-nav"
        style={{
          gridTemplateColumns: `${width <= 767 ? '88px' : '117px'} ${
            width < 1100 ? 'minmax(150px, 1fr)' : '2fr'
          } ${
            width <= 860 ? 'minmax(75px, 80px)' : 'minmax(75px, 180px)'
          } minmax(85px, 1fr) 0.5fr`,
        }}
      >
        <div className="text-md lg:text-lg font-bold uppercase">Number</div>
        <div className="flex justify-center px-5 text-md lg:text-lg font-bold uppercase">
          Time
        </div>
        <div className="flex justify-center px-5 text-md lg:text-lg font-bold uppercase">
          {width <= 860 ? 'Txs' : 'Transactions'}
        </div>
        <div className="flex justify-center px-5 text-md lg:text-lg font-bold uppercase">
          Gas used
        </div>
        <div className="flex justify-center px-5 text-md lg:text-lg font-bold uppercase" />
      </div>
      <div className="bg-white" style={{ flexGrow: 1 }}>
        <Virtuoso
          className="flex flex-col w-full"
          followOutput
          initialTopMostItemIndex={data.blocks.length}
          data={filter ? getFilteredBlocks() : data.blocks}
          itemContent={(index, block) => (
            <BlockView
              onToggleEventDetails={toggleEventDetails}
              data={block}
              index={index}
              key={index}
              width={width}
            />
          )}
        />
      </div>
    </div>
  );
}
