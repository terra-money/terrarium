import React, { useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useBlocks } from '../hooks/terra';
import { BlockView } from '../components';

export default function BlocksPage() {
  const [filter, setFilter] = React.useState(false);
  const state = useBlocks();
  const data = state.get();
  const gridTemplateColumns = '120px minmax(125px, 1fr) minmax(25px, 0.5fr) minmax(25px, 0.5fr) 75px';
  const blocksToShow = filter ? data.blocks.filter(({ block } : {block: any}) => block.data.txs!.length > 0) : data.blocks;

  const handleToggleFilter = () => setFilter(!filter);

  const toggleEventDetails = useCallback((index: number) => {
    state.blocks[index].merge({
      hasEventsOpenInUi: !data.blocks[index].hasEventsOpenInUi,
    });
  }, [state]);

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
        className="bg-white grid items-center w-full px-10 py-5 text-terra-text-muted font-medium text-sm uppercase z-30 border-b border-[#EBEFF8] shadow-very-light-border"
        style={{ gridTemplateColumns }}
      >
        <div>Number</div>
        <div>Time</div>
        <div>Transactions</div>
        <div>Gas used</div>
        <div />
      </div>
      <Virtuoso
        followOutput="smooth"
        className="flex flex-col w-full scrollbar"
        totalCount={blocksToShow.length}
        initialTopMostItemIndex={blocksToShow.length - 1}
        data={blocksToShow}
        itemContent={(index, block) => (
          <BlockView
            onToggleEventDetails={toggleEventDetails}
            data={block}
            index={index}
            key={index}
            gridTemplateColumns={gridTemplateColumns}
          />
        )}
      />
    </div>
  );
}
